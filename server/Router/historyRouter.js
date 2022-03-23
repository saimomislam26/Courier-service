const express = require('express');
const {History} = require('../models/historyModel')
const router = express.Router();
const mongoose = require("mongoose");
const toId = mongoose.Types.ObjectId;


const saveHistory= async (req, res) => {
    if (!req.body.branch || !req.body.user || !req.body.message || !req.body.tag)
    return res.status(400).json({ message: "History information are missing" })
    console.log(req.body);
    let history = new History(req.body)
    const result = await history.save()
    return res.status(200).send(result)  
}

const seeHistory = async (req,res)=>{
    const date = req.params.date
    const branch = req.params.branch
    
    var d = new Date(date);
    d = d.getTime();
    d = new Date(d).toJSON();
    console.log(d);
    var test = d.split("T");
    console.log(test);
    if(branch==='all'){
        var result = await History.aggregate([
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: test[0]
              }
            },
      
          ]);
        // const message = await History.find()
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        result = result.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(result.length);
        const results = {};
        results.results = result.slice(startIndex, endIndex);
        if (endIndex < result.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: result.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: result.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: result.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: result.length,
          };
        }
    
        return res.status(200).send(results)
    }
    else{
        var result = await History.aggregate([
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: test[0],
                branch:toId(branch)
              },
            },
      
          ]);
        // const message = await History.find()
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        result = result.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(result.length);
        const results = {};
        results.results = result.slice(startIndex, endIndex);
        if (endIndex < result.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: result.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: result.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: result.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: result.length,
          };
        }
    
        return res.status(200).send(results)
    }
    
}

const searchHistory =async (req,res)=>{
  let id = req.params.id
  console.log(id);
  if(id === "null"){

    const {searchText} = req.body
    if(!searchText) return res.status(200).json({message:"Field Is Empty"})
    console.log(searchText)
    const result = await History.find({$or:[{message:new RegExp('^'+'.*'+searchText,'i')},{user:new RegExp('^'+searchText,'i')}]})
    if(result.length===0||result===undefined)return res.status(200).json({message:'There Is No Data To Show'})
    else return res.status(200).send(result)
  }
  else{
    id = toId(req.params.id)
    console.log(id);
    const {searchText} = req.body
    if(!searchText) return res.status(200).json({message:"Field Is Empty"})
    console.log(searchText)
    const result = await History.find({$and:[{branch:id},{$or:[{message:new RegExp('^'+'.*'+searchText,'i')},{user:new RegExp('^'+searchText,'i')}]}]})
    
    if(result.length===0||result===undefined)return res.status(200).json({message:'There Is No Data To Show'})
    else return res.status(200).send(result)
  }
    
}



router.route('/historyApi/saveHistory')
    .post(saveHistory)
router.route('/historyApi/seeHistory/:date/:branch')
    .get(seeHistory)
router.route('/historyApi/historySearch/:id')
    .post(searchHistory) 
module.exports = router;
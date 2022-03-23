const express = require("express");
const app = express();
app.use(express.json());
const { Parcel } = require("../models/parcelModel");
const _ = require("lodash");
const router = express.Router();
const mongoose = require("mongoose");
const toId = mongoose.Types.ObjectId;
const { Branch } = require("../models/branchModel");
const { result } = require("lodash");
const { User } = require("../models/userModel");
const moment = require("moment")
const otpGenerator = require('otp-generator')
var FormData = require('form-data');
var axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const utf8 = require('utf8')
const {Count} = require("../models/productCountModel")



const newParcel = async (req, res) => {
  try {
    const {ProductType,SenderName,SenderNumber,SenderEmail,RecieverName,RecieverNumber,RecieverEmail,Totalcost,PaidAmount,PayableAmount,status,SearchId} = req.body
    // const test = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    // console.log(test)
    req.params.send = toId(req.params.send);
    if (!req.params.send)
      return res.status(400).json({ message: "Branch Does Not Exist" });
    req.params.to = toId(req.params.to);
    if (!req.params.send)
      return res.status(400).json({ message: "Branch Does Not Exist" });
    // let count = await Count.find()
    //   let x = count[0].count+1
    //   console.log(x);
    parcel = await Parcel.findOne({ SearchId: req.body.SearchId });
    if (parcel)
      return res.status(400).json({ message: "This ID is already Exists" });
    parcel = new Parcel(req.body);
    parcel.BookedFrom = req.params.to;
    parcel.SendTo = req.params.send;
    parcel.BookedBy = req.params.employee;
    // parcel.SearchId = x
    // parcel.OTP = seq
    const save = await parcel.save();
    const result = await Parcel.findById(save._id).populate(
      "BookedFrom SendTo BookedBy",
      "branch contact Username Email"
    );
    await result.save();
    return res.status(200).send(result);
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong" });
  }
};
const updateCount = async (req,res)=>{
  const id = req.params.id
  const updatedData = req.body
  const count = await Count.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!count) return res.status(400).json({ message: "Error Found"});
    return res.status(200).send(count)
}
const getParcel = async (req, res) => {
  // const calender = req.params.calender;
  // const presentTime = new Date(calender);
  const branch = toId(req.params.branch);
  const parcelId = req.params.parcelid;
  const phn = req.params.phn
  const status = req.params.status;
  console.log(parcelId, phn ,status);
if(phn === "null" && parcelId!=="null"){
  console.log("this");
  const test = await Parcel.findOne({ SearchId: parcelId });
  if (!test) return res.status(400).json({ message: "No Data Matched" });
  // console.log(test)
  // const presentMonth = presentTime.getMonth();

  // const presentYear = presentTime.getFullYear();

  // const presentDate = presentTime.getDate();

  // if (presentMonth < 9 && presentDate < 10) {
  //   LatestDayMonth = `${presentYear}-0${presentMonth + 1}-0${presentDate}`;
  // } else if (presentMonth < 9 && presentDate > 10) {
  //   LatestDayMonth = `${presentYear}-0${presentMonth + 1}-${presentDate}`;
  // } else if (presentMonth >= 9 && presentDate > 10) {
  //   LatestDayMonth = `${presentYear}-${presentMonth + 1}-${presentDate}`;
  // } else {
  //   LatestDayMonth = `${presentYear}-${presentMonth + 1}-0${presentDate}`;
  // }
  if (status === "Booked" || status === "Sent") {
    var result = await Parcel.aggregate([
      // {
      //   $addFields: {
      //     creationDate: {
      //       $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      //     },
      //   },
      // },
      {
        $match: {
          // creationDate: {
          //   $eq: LatestDayMonth,
          // },
          status: status,
          BookedFrom: branch,
          SearchId: parcelId,
        },
      },

      {
        $group: {
          _id: "null",
          // Product: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          // Product: 1
        },
      },
    ]);
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      //return res.status(200).send(result[0].data[0]);
      var promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      var results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      
      return res.status(200).send(results);
    }
  } else if (status === "Recieved" || status === "Delivered") {
    var result = await Parcel.aggregate([
      // {
      //   $addFields: {
      //     creationDate: {
      //       $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      //     },
      //   },
      // },
      {
        $match: {
          // creationDate: {
          //   $eq: LatestDayMonth,
          // },
          status: status,
          SendTo: branch,
          SearchId: parcelId,
        },
      },

      {
        $group: {
          _id: "null",
          // Product: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else{
      // return res.status(200).send(result[0].data[0]);
      var promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      var results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      
      return res.status(200).send(results);
    }
  } else {
    var result = await Parcel.aggregate([
      // {
      //   $addFields: {
      //     creationDate: {
      //       $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
      //     },
      //   },
      // },
      {
        $match: {
          // creationDate: {
          //   $eq: LatestDayMonth,
          // },
          status: "Sent",
          SendTo: branch,
          SearchId: parcelId,
        },
      },

      {
        $group: {
          _id: "null",
          // Product: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else{
      // return res.status(200).send(result[0].data[0]);
      var promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      var results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      
      return res.status(200).send(results);
    }
  }
  
}
else if(phn !== "null" && parcelId==="null") {
  console.log("id null");
  const test = await Parcel.findOne({$or: [{ SenderNumber: phn }, { RecieverNumber: phn }]});
  if (!test) return res.status(400).json({ message: "No Data Matched" });
  console.log("dasffas",test)

  if (status === "Booked" || status === "Sent") {
    var result = await Parcel.aggregate([
      {
        $match: {
          status: status,
          BookedFrom: branch,
          $or: [{ SenderNumber:parseInt(phn) }, { RecieverNumber:parseInt(phn) }]
        },
      },

      {
        $group: {
          _id: "null",
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else{
      // return res.status(200).send(result[0].data[0]);
      var promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      var results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      
      return res.status(200).send(results);
    }
  } else if (status === "Recieved" || status === "Delivered") {
    var result = await Parcel.aggregate([
      {
        $match: {
          status: status,
          SendTo: branch,
          $or:[{ SenderNumber: parseInt(phn) }, { RecieverNumber: parseInt(phn) }]
        },
      },

      {
        $group: {
          _id: "null",
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    console.log(result)
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else{
      // return res.status(200).send(result[0].data);
      var promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      var results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      
      return res.status(200).send(results);
    }
  } else {
    var result = await Parcel.aggregate([
      {
        $match: {
          // status: "Sent",
          SendTo: branch,
          $or: [{ SenderNumber:parseInt(phn) }, { RecieverNumber:parseInt(phn) }]
        },
      },

      {
        $group: {
          _id: "null",
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else{
       //return res.status(200).send(result);
       var promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      var results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      
      return res.status(200).send(results);
    }
  }
}
else{
  return res.status(200).json({message:"This Is Wrong Searching"})
}
  
};


const allParcel = async (req, res) => {
  const parcel = await Parcel.find().populate(
    "BookedFrom SendTo BookedBy",
    "branch contact Username Email"
  );
  if (!parcel) return res.status(400).json({ message: "No Parcel Found" });
  return res.status(200).send(parcel);
};

const sendOTP = async(req,res)=>{
  const RecieverNumber = req.body.RecieverNumber
  const id = toId(req.params.id);
  var seq = ""+(Math.floor(Math.random() * 100000) + 100000);
      console.log(typeof(seq), seq);
      const parcel = await Parcel.findByIdAndUpdate(id,{OTP:seq}, {
        new: true,
      })
      await parcel.save();
      console.log(parcel)
      let otp = utf8.encode(`আপনার পার্সেল সংগ্রহ করার ওয়ান টাইম পাসওয়ার্ড(OTP)  টি হল ${parcel.OTP} । এই ওয়ান টাইম পাসওয়ার্ড(OTP) টির মেয়াদ  ${process.env.OTPTIMELIMIT} মিনিট। `)
      console.log(RecieverNumber,parcel.OTP)
      var config = {
        method: 'get',
        url: `https://api.mobireach.com.bd/SendTextMessage?Username=coredevs&Password=Core.2021@&From=Coredevs&To=${RecieverNumber}&Message=${otp}`,
        headers: { }
      };
    
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
    
    return res.status(200).json({message:"OK"})
}

const updateParcel = async (req, res) => {
  const OTP = req.query.OTP
  const id = toId(req.params.id);
  const updatedData = req.body;
  
  console.log(id)
  try {
    if(updatedData.status === 'Delivered'){
     
      // 
      const checkOTP = await Parcel.find({_id:id,OTP:OTP})
      console.log(checkOTP);
      var today = new Date();
      console.log(checkOTP[0].updatedAt)
      var Christmas = new Date(checkOTP[0].updatedAt);
      var diffMs = (Christmas - today); // milliseconds between now & Christmas
      var diffDays = Math.floor(diffMs / 86400000); // days
      var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
      var diffMins = Math.abs(Math.round(((diffMs % 86400000) % 3600000) / 60000)); // minutes
      
      console.log(diffMins)
      
      if(checkOTP===undefined || checkOTP.length===0) return res.status(400).json({message:"Wrong OTP"})
      else if(diffMins<=30){
        const parcel = await Parcel.findByIdAndUpdate(id, updatedData, {
          new: true,
        });
        if (!parcel) return res.status(400).json({ message: "Parcel Not Found" });
      return res.status(200).send(parcel)
      }
      else{
        return res.status(400).json({message:"OTP Time Limit Finished "})
      }
    }
      
    else{
      const parcel = await Parcel.findByIdAndUpdate(id, updatedData, {
        new: true,
      });
      if (!parcel) return res.status(400).json({ message: "Parcel Not Found" });
      return res.status(200).send(parcel)
;
    }
    
    
  } catch (err) {
    return res.status(400).json({ message: "Wrong OTP" });
  }
}

const newUpdateParcel = async(req,res)=>{
  const id = toId(req.params.id);
  const updatedData = req.body;
  const parcel = await Parcel.findByIdAndUpdate(id, updatedData, {
    new: true,
  });
  if(!parcel) return res.status(400).json({message:"Parcel Not Found"})
  return res.status(200).send(parcel)
}

const deleteParcel = async (req, res) => {
  const id = req.params.id;
  try {
    const parcel = await Parcel.findByIdAndDelete(id);
    if (!parcel) return res.status(400).json({ message: "Parcel Not Found" });
    return res.status(200).send(parcel);
  } catch (err) {
    return res.status(400).send("Parcel Not Found");
  }
};
// GET /parcelApi/deleteParcel/sorted?sortBy=createdAt:desc
const sortedData = async (req, res) => {
  var name = req.query.sortBy;
  console.log(name);
  var obj = {};
  if (req.query.sortBy) {
    const parts = name.split(":");
    obj[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  console.log(obj);

  Parcel.find()
    .populate("BookedFrom SendTo", "branch")
    .sort(obj)
    .exec(function (err, parcels) {
      if (err) {
        res.status(404).send({
          message: err,
          data: [],
        });
      } else {
        res.status(200).send({
          message: "OK",
          data: parcels,
        });
      }
    });
};

const comingProduct = async (req, res) => {
  const id = req.params.id;
  const result = await Parcel.find({ SendTo: id });
  if (!result) return res.status(400).json({ message: "No Parcel Available" });
  res.status(200).send(result);
};

//GET `${process.env.REACT_APP_HOST_NAME}parcelApi/deleteParcel/getData`

const getData = async (req, res) => {
  const time = req.params.time;
  var result;
  if (time === "month") {
    const d = new Date().toISOString();
    console.log(d);
    var test = d.slice(0, 7);
    console.log(test);
    result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          status: "Delivered",
          creationDate: test,
        },
      },
      {
        // {
        //     $month:'$createdAt'
        // }
        $group: {
          _id: "$creationDate",
          Delivered: { $sum: 1 },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
  } else if (time === "day") {
    const d = new Date().toISOString();
    console.log(d);
    var test = d.split("T");
    console.log(test);
    result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          status: "Delivered",
          creationDate: test[0],
        },
      },

      {
        $group: {
          _id: "$creationDate",
          Delivered: { $sum: 1 },
        },
      },
      {
        $addFields: { day: "$_id" },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);
  } else if (time === "week") {
    const presentTime = new Date();
    const e = presentTime.getTime() - 7 * 24 * 60 * 60 * 1000;
    var earlierTime = new Date(e).toJSON();
    var updatedeTime = earlierTime.split("T");
    console.log(updatedeTime[0]);
    const updatedpTime = presentTime.toISOString();
    var updatedpTime1 = updatedpTime.split("T");
    console.log(updatedpTime1[0]);

    result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          status: "Delivered",
          creationDate: {
            $lte: updatedpTime1[0],
            $gte: updatedeTime[0],
          },
        },
      },

      {
        $group: {
          _id: "$creationDate",

          Delivered: { $sum: 1 },
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);
  } else {
    result = await Parcel.aggregate([
      {
        $match: { status: "Delivered" },
      },
      {
        $group: {
          _id: {
            $year: "$createdAt",
          },
          Delivered: { $sum: 1 },
        },
      },
      {
        $addFields: { Year: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
  }
  // console.log(time)

  res.status(200).json({
    status: "success",
    data: {
      result,
    },
  });
};

const BookedBranchData = async (req, res) => {
  const time = req.params.time;
  const status = req.params.status;
  const branchId = req.params.branchId;
  let sortingBranch = req.params.sortingBranch
  if(sortingBranch!=="null"){
    sortingBranch = toId(req.params.sortingBranch)
  }
  else{
    sortingBranch = "null"
  }
  console.log(branchId);
  const testing = toId(branchId);
  console.log(testing);
  var d = new Date(time);
  d = d.getTime();
  d = new Date(d).toJSON();
  console.log(d);
  var test = d.split("T");
  console.log(test);

  var result;
  if(sortingBranch==="null"){
    if (status === "Booked") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Booked: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
  
        {
          $project: {
            _id: 0,
            data: 1,
            Booked: 1,
          },
        },
      ]);
      var parcel;
      // const Booked  = result[0].Booked
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
         promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        
        return res.status(200).send(results);
      }
    } 
    else if (status === "Recieved") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Recieved: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Recieved: 1,
          },
        },
      ]);
  
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
    else if (status === "Sent") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Sent: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Sent: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
    else if (status === "Delivered") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Delivered: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Booked: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
    else {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
            },
          },
        },
        {
          $match: {
            status: "Sent",
            creationDate: test[0],
            SendTo:sortingBranch ,
          },
        },
  
        {
          $group: {
            _id: null,
            Upcoming: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Upcoming: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
  }
  else if(sortingBranch!=="null"){
    if (status === "Booked") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Booked: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
  
        {
          $project: {
            _id: 0,
            data: 1,
            Booked: 1,
          },
        },
      ]);
      var parcel;
      // const Booked  = result[0].Booked
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
         promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        
        return res.status(200).send(results);
      }
    } 
    else if (status === "Recieved") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Recieved: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Recieved: 1,
          },
        },
      ]);
  
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
    else if (status === "Sent") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Sent: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Sent: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
    else if (status === "Delivered") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Delivered: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Booked: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
    else {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
            },
          },
        },
        {
          $match: {
            status: "Sent",
            creationDate: test[0],
            BookedFrom: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Upcoming: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Upcoming: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
  }
  else{
    return res.status(200).json({message:"error"})
  }

};

// const SentBranchData = async (req, res) => {
//   const time = req.params.time;
//   const status = req.params.status;
//   const branchId = req.params.branchId;
//   console.log(branchId);
//   const testing = toId(branchId);
//   console.log(testing);
//   var d = new Date(time);
//   d = d.getTime();
//   d = new Date(d).toJSON();
//   console.log(d);
//   var test = d.split("T");
//   console.log(test);
//   var result;
//   if (status === "Booked") {
//     result = await Parcel.aggregate([
//       {
//         $addFields: {
//           creationDate: {
//             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//           },
//         },
//       },
//       {
//         $match: {
//           status: status,
//           creationDate: test[0],
//           SendTo: testing,
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           Booked: { $sum: 1 },
//           data: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           data: 1,
//           Booked: 1,
//         },
//       },
//     ]);
//     if (result.length < 1 || result === undefined) {
//       return res.status(400).json({ message: "There is no data to show" });
//     } else {
//       var promises = await Promise.all(
//         result[0].data.map(async (val, ind) => {
//           var parcel = await Parcel.findById({ _id: val._id }).populate(
//             "BookedFrom SendTo",
//             "branch"
//           );
//           return parcel;
//         })
//       );
//       promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
//       const page = parseInt(req.query.page);
//       const limit = parseInt(req.query.limit);

//       const startIndex = (page - 1) * limit;
//       const endIndex = page * limit;
//       console.log(promises.length);
//       const results = {};
//       results.results = promises.slice(startIndex, endIndex);
//       if (endIndex < promises.length) {
//         results.next = {
//           page: page + 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.next = {
//           page: page,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       if (startIndex > 0) {
//         results.prev = {
//           page: page - 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.prev = {
//           page: 0,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       return res.status(200).send(results);
//     }
//   } else if (status === "Recieved") {
//     result = await Parcel.aggregate([
//       {
//         $addFields: {
//           creationDate: {
//             $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
//           },
//         },
//       },
//       {
//         $match: {
//           status: status,
//           creationDate: test[0],
//           SendTo: testing,
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           Recieved: { $sum: 1 },
//           data: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           data: 1,
//           Recieved: 1,
//         },
//       },
//     ]);
//     if (result.length < 1 || result === undefined) {
//       return res.status(400).json({ message: "There is no data to show" });
//     } else {
//       var promises = await Promise.all(
//         result[0].data.map(async (val, ind) => {
//           var parcel = await Parcel.findById({ _id: val._id }).populate(
//             "BookedFrom SendTo",
//             "branch"
//           );
//           return parcel;
//         })
//       );
//       promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
//       const page = parseInt(req.query.page);
//       const limit = parseInt(req.query.limit);

//       const startIndex = (page - 1) * limit;
//       const endIndex = page * limit;
//       console.log(promises.length);
//       const results = {};
//       results.results = promises.slice(startIndex, endIndex);
//       if (endIndex < promises.length) {
//         results.next = {
//           page: page + 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.next = {
//           page: page,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       if (startIndex > 0) {
//         results.prev = {
//           page: page - 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.prev = {
//           page: 0,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       return res.status(200).send(results);
//     }
//   } else if (status === "Sent") {
//     result = await Parcel.aggregate([
//       {
//         $addFields: {
//           creationDate: {
//             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//           },
//         },
//       },
//       {
//         $match: {
//           status: status,
//           creationDate: test[0],
//           SendTo: testing,
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           Sent: { $sum: 1 },
//           data: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           data: 1,
//           Booked: 1,
//         },
//       },
//     ]);
//     if (result.length < 1 || result === undefined) {
//       return res.status(400).json({ message: "There is no data to show" });
//     } else {
//       var promises = await Promise.all(
//         result[0].data.map(async (val, ind) => {
//           var parcel = await Parcel.findById({ _id: val._id }).populate(
//             "BookedFrom SendTo",
//             "branch"
//           );
//           return parcel;
//         })
//       );
//       promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
//       const page = parseInt(req.query.page);
//       const limit = parseInt(req.query.limit);

//       const startIndex = (page - 1) * limit;
//       const endIndex = page * limit;
//       console.log(promises.length);
//       const results = {};
//       results.results = promises.slice(startIndex, endIndex);
//       if (endIndex < promises.length) {
//         results.next = {
//           page: page + 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.next = {
//           page: page,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       if (startIndex > 0) {
//         results.prev = {
//           page: page - 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.prev = {
//           page: 0,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       return res.status(200).send(results);
//     }
//   } else if (status === "Delivered") {
//     result = await Parcel.aggregate([
//       {
//         $addFields: {
//           creationDate: {
//             $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
//           },
//         },
//       },
//       {
//         $match: {
//           status: status,
//           creationDate: test[0],
//           SendTo: testing,
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           Delivered: { $sum: 1 },
//           data: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           data: 1,
//           Delivered: 1,
//         },
//       },
//     ]);
//     if (result.length < 1 || result === undefined) {
//       return res.status(400).json({ message: "There is no data to show" });
//     } else {
//       var promises = await Promise.all(
//         result[0].data.map(async (val, ind) => {
//           var parcel = await Parcel.findById({ _id: val._id }).populate(
//             "BookedFrom SendTo",
//             "branch"
//           );
//           return parcel;
//         })
//       );
//       promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
//       const page = parseInt(req.query.page);
//       const limit = parseInt(req.query.limit);

//       const startIndex = (page - 1) * limit;
//       const endIndex = page * limit;
//       console.log(promises.length);
//       const results = {};
//       results.results = promises.slice(startIndex, endIndex);
//       if (endIndex < promises.length) {
//         results.next = {
//           page: page + 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.next = {
//           page: page,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       if (startIndex > 0) {
//         results.prev = {
//           page: page - 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.prev = {
//           page: 0,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       return res.status(200).send(results);
//     }
//   } else {
//     result = await Parcel.aggregate([
//       {
//         $addFields: {
//           creationDate: {
//             $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
//           },
//         },
//       },
//       {
//         $match: {
//           status: "Sent",
//           creationDate: test[0],
//           SendTo: testing,
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           Upcoming: { $sum: 1 },
//           data: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           data: 1,
//           Upcoming: 1,
//         },
//       },
//     ]);
//     if (result.length < 1 || result === undefined) {
//       return res.status(400).json({ message: "There is no data to show" });
//     } else {
//       var promises = await Promise.all(
//         result[0].data.map(async (val, ind) => {
//           var parcel = await Parcel.findById({ _id: val._id }).populate(
//             "BookedFrom SendTo",
//             "branch"
//           );
//           return parcel;
//         })
//       );
//       promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
//       const page = parseInt(req.query.page);
//       const limit = parseInt(req.query.limit);

//       const startIndex = (page - 1) * limit;
//       const endIndex = page * limit;
//       console.log(promises.length);
//       const results = {};
//       results.results = promises.slice(startIndex, endIndex);
//       if (endIndex < promises.length) {
//         results.next = {
//           page: page + 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.next = {
//           page: page,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       if (startIndex > 0) {
//         results.prev = {
//           page: page - 1,
//           limit: limit,
//           len: promises.length,
//         };
//       } else {
//         results.prev = {
//           page: 0,
//           limit: limit,
//           len: promises.length,
//         };
//       }

//       return res.status(200).send(results);
//     }
//   }
// };


const SentBranchData = async (req, res) => {
  const phn = req.params.phn
  console.log(phn);
  const time = req.params.time;
  const status = req.params.status;
  const branchId = req.params.branchId;
  let sortingBranch = req.params.sortingBranch
  if(sortingBranch!=="null"){
    sortingBranch = toId(req.params.sortingBranch)
  }
  else{
    sortingBranch = "null"
  }
  
  console.log(branchId);
  const testing = toId(branchId);
  console.log(testing);
  var d = new Date(time);
  d = d.getTime();
  d = new Date(d).toJSON();
  console.log(d);
  var test = d.split("T");
  console.log(test);
  var result;
  if(sortingBranch==="null"){
    if (status === "Booked") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Booked: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Booked: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
     else if (status === "Recieved") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Recieved: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Recieved: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
    else if (status === "Sent") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Sent: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Booked: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
     else if (status === "Delivered"&&phn==='null') {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Delivered: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Delivered: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
  
    else if(status === "Delivered"&&phn!=='null'){
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: testing,
            $or:[{RecieverNumber:parseInt(phn)},{SenderNumber:parseInt(phn)}]
          },
        },
  
        {
          $group: {
            _id: null,
            Delivered: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Delivered: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
    else {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
            },
          },
        },
        {
          $match: {
            status: "Sent",
            creationDate: test[0],
            SendTo: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Upcoming: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Upcoming: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
  }
  else if(sortingBranch!=="null"){
    if (status === "Booked") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: testing,
          },
        },
  
        {
          $group: {
            _id: null,
            Booked: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Booked: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
     else if (status === "Recieved") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Recieved: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Recieved: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
    else if (status === "Sent") {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            SendTo: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Sent: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Booked: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
     else if (status === "Delivered"&&phn==='null') {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Delivered: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Delivered: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    } 
  
    else if(status === "Delivered"&&phn!=='null'){
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            status: status,
            creationDate: test[0],
            BookedFrom: sortingBranch,
            $or:[{RecieverNumber:parseInt(phn)},{SenderNumber:parseInt(phn)}]
          },
        },
  
        {
          $group: {
            _id: null,
            Delivered: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Delivered: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
    else {
      result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
            },
          },
        },
        {
          $match: {
            status: "Sent",
            creationDate: test[0],
            BookedFrom: sortingBranch,
          },
        },
  
        {
          $group: {
            _id: null,
            Upcoming: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
            Upcoming: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" });
      } else {
        var promises = await Promise.all(
          result[0].data.map(async (val, ind) => {
            var parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
  
        return res.status(200).send(results);
      }
    }
  }
  else{
    return res.status(200).json({message:"Error"})
  }
 
};
const SelfData = async (req, res) => {
  var userId = req.params.userId;
  userId = toId(userId);
  const time = req.params.date;
  var d = new Date(time);
  d = d.getTime();
  d = new Date(d).toJSON();
  console.log(d);
  var test = d.split("T");
  console.log(test);
  var result;
  result = await Parcel.aggregate([
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
        BookedBy: userId,
      },
    },

    {
      $group: {
        _id: null,
        Count: { $sum: 1 },
        data: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        data: 1,
        Count: 1,
      },
    },
  ]);
  if (result.length < 1 || result === undefined) {
    return res.status(400).json({ message: "There is no data to show" });
  } else {
    const promises = await Promise.all(
      result[0].data.map(async (val, ind) => {
        var parcel = await Parcel.findById({ _id: val._id }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return parcel;
      })
    );

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log(promises.length);
    const results = {};
    results.results = promises.slice(startIndex, endIndex);
    if (endIndex < promises.length) {
      results.next = {
        page: page + 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.next = {
        page: page,
        limit: limit,
        len: promises.length,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.prev = {
        page: 0,
        limit: limit,
        len: promises.length,
      };
    }

    return res.status(200).send(results);
  }
};

const generateProductId = async (req, res) => {
  let r = (Math.random() + 1).toString(36).substring(7);
  const parcel = await Parcel.findOne({ SearchId: r });
  if (parcel)
    return res
      .status(400)
      .json({ mesage: "This Id Is already Exists.Click Again to get new Id" });
  return res.status(200).send({
    searchId: r,
  });
};

const subAdminDash = async (req, res) => {
  const calender = req.params.calender;
  const date = req.params.date;
  if (date === "Monthly") {
    const presentTime = new Date(calender);

    const presentMonth = presentTime.getMonth();
    console.log(presentMonth);
    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    if (presentMonth < 9) {
      const FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
      console.log(FirstDayMonth);
      const LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
      console.log(LastDayMonth);
    } else {
      const FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
      console.log(FirstDayMonth);
      const LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
      console.log(LastDayMonth);
    }

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          // status:'Delivered'
        },
      },

      {
        $group: {
          _id: "$creationDate",
          // Total:{$add:['$TotalCost','$PaidAmount']},
          Booked: { $sum: "$TotalCost" },
          PaidAmount: { $sum: "$PaidAmount" },
          PayableAmount: { $sum: "$PayableAmount" },
        },
      },
      // {
      //     $match: {
      //         status:'Delivered'
      //     }
      // },
      // {
      //     $group:{
      //         _id:null,
      //         PayableAmount:{ $sum: '$PayableAmount' }

      //     }
      // },
      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  } else {
    const presentTime = new Date(calender);

    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    const FirstDayMonth = `${presentYear}-01`;
    console.log(FirstDayMonth);
    const LastDayMonth = `${presentYear}-12`;
    console.log(LastDayMonth);

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
        },
      },

      {
        $group: {
          _id: "$creationDate",
          Booked: { $sum: "$TotalCost" },
          PaidAmount: { $sum: "$PaidAmount" },
          PayableAmount: { $sum: "$PayableAmount" },
        },
      },

      {
        $addFields: { Month: "$_id" },
      },
      {
        $sort: { Month: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);
    res.status(200).send(result);
  }
};

const subAdminDashCard = async (req, res) => {
  const branch = req.params.branch;
  console.log(branch);
  const result = await Parcel.aggregate([
    {
      // $match:{
      //     $BookedFrom:toId(branchId)
      // },
      $group: {
        _id: "$status",
        Total: { $sum: 1 },
      },
    },
  ]);
  return res.status(200).send(result);
};
const subAdminHistory = async (req, res) => {
  const calender = req.params.calender;

  const presentTime = new Date(calender);
  const branch = toId(req.params.branch);

  const presentMonth = presentTime.getMonth();

  const presentYear = presentTime.getFullYear();

  const presentDate = presentTime.getDate();

  if (presentMonth < 9 && presentDate < 10) {
    LatestDayMonth = `${presentYear}-0${presentMonth + 1}-0${presentDate}`;
  } else if (presentMonth < 9 && presentDate > 10) {
    LatestDayMonth = `${presentYear}-0${presentMonth + 1}-${presentDate}`;
  } else if (presentMonth >= 9 && presentDate > 10) {
    LatestDayMonth = `${presentYear}-${presentMonth + 1}-${presentDate}`;
  } else {
    LatestDayMonth = `${presentYear}-${presentMonth + 1}-0${presentDate}`;
  }
  console.log(LatestDayMonth);

  const result = await Parcel.aggregate([
    {
      $addFields: {
        creationDate: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
      },
    },
    {
      $match: {
        creationDate: {
          $eq: LatestDayMonth,
        },
        BookedFrom: branch,
      },
    },

    {
      $group: {
        _id: "null",
        Product: { $sum: 1 },
        data: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        data: 1,
        Product: 1,
      },
    },
  ]);
  console.log(result);
  if (result.length < 1 || result === undefined) {
    return res.status(400).json({ message: "There is no data to show" });
  } else {
    const promises = await Promise.all(
      result[0].data.map(async (val, ind) => {
        var parcel = await Parcel.findById({ _id: val._id }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return parcel;
      })
    );

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log(promises.length);
    const results = {};
    results.results = promises.slice(startIndex, endIndex);
    if (endIndex < promises.length) {
      results.next = {
        page: page + 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.next = {
        page: page,
        limit: limit,
        len: promises.length,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.prev = {
        page: 0,
        limit: limit,
        len: promises.length,
      };
    }

    return res.status(200).send(results);
  }
};

const subAdminHistorySend = async (req, res) => {
  const calender = req.params.calender;

  const presentTime = new Date(calender);
  const branch = toId(req.params.branch);
  console.log(branch);
  const presentMonth = presentTime.getMonth();
  console.log(presentMonth);
  const presentYear = presentTime.getFullYear();
  console.log(presentYear);
  const presentDate = presentTime.getDate();
  console.log(presentDate);
  var LatestDayMonth;
  if (presentMonth < 9 && presentDate < 10) {
    LatestDayMonth = `${presentYear}-0${presentMonth + 1}-0${presentDate}`;
  } else if (presentMonth < 9 && presentDate > 10) {
    LatestDayMonth = `${presentYear}-0${presentMonth + 1}-${presentDate}`;
  } else if (presentMonth >= 9 && presentDate > 10) {
    LatestDayMonth = `${presentYear}-${presentMonth + 1}-${presentDate}`;
  } else {
    LatestDayMonth = `${presentYear}-${presentMonth + 1}-0${presentDate}`;
  }

  console.log(LatestDayMonth);

  const result = await Parcel.aggregate([
    {
      $addFields: {
        updatedDate: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
      },
    },
    {
      $match: {
        updatedDate: {
          $eq: LatestDayMonth,
        },
        SendTo: branch,

        $or: [{ status: "Delivered" }, { status: "Recieved" }],
      },
    },

    {
      $group: {
        _id: "null",
        // Total:{$add:['$TotalCost','$PaidAmount']},
        // Booked: { $sum: "$TotalCost" },
        // PaidAmount: { $sum: "$PaidAmount" },
        // PayableAmount: { $sum: '$PayableAmount' }
        Product: { $sum: 1 },
        data: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        data: 1,
        Product: 1,
      },
    },
  ]);

  console.log(result);
  // const Product  = result[0].Product
  if (result.length < 1 || result === undefined) {
    return res.status(400).json({ message: "There is no data to show" });
  } else {
    const promises = await Promise.all(
      result[0].data.map(async (val, ind) => {
        var parcel = await Parcel.findById({ _id: val._id }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return parcel;
      })
    );

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log(promises.length);
    const results = {};
    results.results = promises.slice(startIndex, endIndex);
    if (endIndex < promises.length) {
      results.next = {
        page: page + 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.next = {
        page: page,
        limit: limit,
        len: promises.length,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.prev = {
        page: 0,
        limit: limit,
        len: promises.length,
      };
    }

    return res.status(200).send(results);
  }
};

const TestAdminDash = async (req, res) => {
  const calender = req.params.calender;
  const date = req.params.date;
  console.log(req.params.branchId)
  const branchId = toId(req.params.branchId);
  console.log(branchId)
  const department = req.params.department;
  console.log(department);
  console.log(branchId);
  if (date === "Monthly" && department === "Booked") {
    const presentTime = new Date(calender);
    const presentMonth = presentTime.getMonth();
    console.log(presentMonth);
    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    var FirstDayMonth;
    var LastDayMonth;
    if (presentMonth < 9) {
      if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
        FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-0${presentMonth + 1}-31`;
        console.log(LastDayMonth);
    }
    else {
        FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
        console.log(LastDayMonth);
    }
    } else {
      if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
        FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-${presentMonth + 1}-31`;
        console.log(LastDayMonth);
    }
    else {
        FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
        console.log(LastDayMonth);
    }
    }

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          BookedFrom: branchId,
        },
      },

      {
        $group: {
          _id: "$creationDate",
          // Total:{$add:['$TotalCost','$PaidAmount']},
          onCondition: { $sum: "$onCondition" },
          PayableAmount: { $sum: "$PayableAmount" },
          PaidAmount:{$sum: "$PaidAmount"},
          TotalCost:{$sum: "$TotalCost"}
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  } else if (date === "Monthly" && department === "Delivered") {
    const presentTime = new Date(calender);

    const presentMonth = presentTime.getMonth();
    console.log(presentMonth);
    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    var FirstDayMonth;
    var LastDayMonth;
    if (presentMonth < 9) {
      if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
        FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-0${presentMonth + 1}-31`;
        console.log(LastDayMonth);
    }
    else {
        FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
        console.log(LastDayMonth);
    }
    } else {
      if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
        FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-${presentMonth + 1}-31`;
        console.log(LastDayMonth);
    }
    else {
        FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
        console.log(LastDayMonth);
    }
    }

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          SendTo: branchId,
        },
      },

      {
        $group: {
          _id: "$creationDate",
          // Total:{$add:['$TotalCost','$PaidAmount']},
          onCondition: { $sum: "$onCondition" },
          PayableAmount: { $sum: "$PayableAmount" },
          TotalCost: { $sum: "$TotalCost" },
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  } else if (date === "Yearly" && department === "Delivered") {
    const presentTime = new Date(calender);

    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    const FirstDayMonth = `${presentYear}-01`;
    console.log(FirstDayMonth);
    const LastDayMonth = `${presentYear}-12`;
    console.log(LastDayMonth);

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m", date: "$updatedAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          SendTo: branchId,
        },
      },

      {
        $group: {
          _id: "$creationDate",
          onCondition: { $sum: "$onCondition" },
          PayableAmount: { $sum: "$PayableAmount" },
          TotalCost: { $sum: "$TotalCost" },
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  } 
  else if(date === "Yearly" && department === "Booked") {
    const presentTime = new Date(calender);

    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    const FirstDayMonth = `${presentYear}-01`;
    console.log(FirstDayMonth);
    const LastDayMonth = `${presentYear}-12`;
    console.log(LastDayMonth);

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          BookedFrom: branchId,
        },
      },

      {
        $group: {
          _id: "$creationDate",
          onCondition: { $sum: "$onCondition" },
          PayableAmount: { $sum: "$PayableAmount" },
          PaidAmount:{$sum: "$PaidAmount"},
          TotalCost:{$sum: "$TotalCost"}
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  }

// sad
else if (date === "Weekly" && department == "Booked") {

  const today = moment();
        console.log(today.format());

        // const momentTryFirst = moment(today).subtract(1, "week").startOf("week").format("YYYY-MM-DD")
        const momentTryLast = moment(today).subtract(1, "week").endOf("week").format("YYYY-MM-DD")

        // console.log(momentTryFirst)
        console.log(momentTryLast);
        const test = moment().day('friday').format("YYYY-MM-DD")
        console.log(test)

  const result = await Parcel.aggregate([
      {
          $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }
      },
      {
          $match: {
              creationDate: {
                  $lte: test,
                  $gte:momentTryLast
              },
              BookedFrom: branchId
          }
      },

      {
          $group: {
              _id: '$creationDate',
              // Total:{$add:['$TotalCost','$PaidAmount']},                
              onCondition: { $sum: "$onCondition" },
          PayableAmount: { $sum: "$PayableAmount" },
          PaidAmount:{$sum: "$PaidAmount"},
          TotalCost:{$sum: "$TotalCost"}

          }

      },


      {
          $addFields: { week_day: '$_id' }
      },
      {
          $sort: { week_day: 1 }
      },

      {
          $project: {
              _id: 0,

          }
      },

  ]
  )


  res.status(200).send(result)
}
else{
  const today = moment();
        console.log(today.format());

        // const momentTryFirst = moment(today).subtract(1, "week").startOf("week").format("YYYY-MM-DD")
        const momentTryLast = moment(today).subtract(1, "week").endOf("week").format("YYYY-MM-DD")

        // console.log(momentTryFirst)
        console.log(momentTryLast);
        const test = moment().day('friday').format("YYYY-MM-DD")
        console.log(test)

  const result = await Parcel.aggregate([
      {
          $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
      },
      {
          $match: {
              creationDate: {
                  $lte:test ,
                  $gte: momentTryLast
              },
              SendTo: branchId,
          }
      },

      {
          $group: {
              _id: '$creationDate',
              onCondition: { $sum: "$onCondition" },
              PayableAmount: { $sum: "$PayableAmount" },
              TotalCost: { $sum: "$TotalCost" },
          }

      },


      {
          $addFields: { week_day: '$_id' }
      },
      {
          $sort: { week_day: 1 }
      },

      {
          $project: {
              _id: 0,

          }
      },

  ]
  )


  res.status(200).send(result)
}
// sads
};

const AdminDash = async (req, res) => {
  const calender = req.params.calender;
  const date = req.params.date;
  const branchId = toId(req.params.branchId);
  console.log(branchId);
  if (date === "Monthly") {
    const presentTime = new Date(calender);

    const presentMonth = presentTime.getMonth();
    console.log(presentMonth);
    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    let FirstDayMonth;
    let LastDayMonth;
    if (presentMonth < 9) {
      FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
      console.log(FirstDayMonth);
      LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
      console.log(LastDayMonth);
    } else {
      FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
      console.log(FirstDayMonth);
      LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
      console.log(LastDayMonth);
    }

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          BookedFrom: branchId,
        },
      },

      {
        $group: {
          _id: "$creationDate",
          // Total:{$add:['$TotalCost','$PaidAmount']},
          Delivered: { $sum: "$TotalCost" },
          PaidAmount: { $sum: "$PaidAmount" },
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  } else {
    const presentTime = new Date(calender);

    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    const FirstDayMonth = `${presentYear}-01`;
    console.log(FirstDayMonth);
    const LastDayMonth = `${presentYear}-12`;
    console.log(LastDayMonth);

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          BookedFrom: branchId,
        },
      },

      {
        $group: {
          _id: "$creationDate",
          Delivered: { $sum: "$TotalCost" },
          PaidAmount: { $sum: "$PaidAmount" },
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  }
};
const AdminDashAll = async (req, res) => {
  const calender = req.params.calender
  const date = req.params.date
  const department = req.params.department

  if (date === "Monthly" && department == "Booked") {
      const presentTime = new Date(calender)
      const presentMonth = presentTime.getMonth()
      console.log(presentMonth)
      const presentYear = presentTime.getFullYear()
      console.log(presentYear)
      var FirstDayMonth
      var LastDayMonth
      if (presentMonth < 9) {
          if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
            FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
            console.log(FirstDayMonth);
            LastDayMonth = `${presentYear}-0${presentMonth + 1}-31`;
            console.log(LastDayMonth);
        }
        else {
            FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
            console.log(FirstDayMonth);
            LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
            console.log(LastDayMonth);
        }

      }
      else {
          if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
              FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
              console.log(FirstDayMonth);
              LastDayMonth = `${presentYear}-${presentMonth + 1}-31`;
              console.log(LastDayMonth);
          }
          else {
              FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
              console.log(FirstDayMonth);
              LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
              console.log(LastDayMonth);
          }

      }



      const result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }
          },
          {
              $match: {
                  creationDate: {
                      $lte: LastDayMonth,
                      $gte: FirstDayMonth
                  },

              }
          },

          {
              $group: {
                  _id: '$creationDate',
                  // Total:{$add:['$TotalCost','$PaidAmount']}, 
                  PaidAmount: { $sum: "$PaidAmount" },               
                  onCondition: { $sum: "$onCondition" },
                  PayableAmount: { $sum: "$PayableAmount" }

              }

          },


          {
              $addFields: { week_day: '$_id' }
          },
          {
              $sort: { week_day: 1 }
          },

          {
              $project: {
                  _id: 0,

              }
          },

      ]
      )


      res.status(200).send(result)
  }
  else if (date === "Monthly" && department == "Delivered") {
      const presentTime = new Date(calender)

      const presentMonth = presentTime.getMonth()
      console.log(presentMonth)
      const presentYear = presentTime.getFullYear()
      console.log(presentYear)
      var FirstDayMonth
      var LastDayMonth
      if (presentMonth < 9) {
        if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
          FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
          console.log(FirstDayMonth);
          LastDayMonth = `${presentYear}-0${presentMonth + 1}-31`;
          console.log(LastDayMonth);
      }
      else {
          FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
          console.log(FirstDayMonth);
          LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
          console.log(LastDayMonth);
      }
      }
      else {
        if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
          FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
          console.log(FirstDayMonth);
          LastDayMonth = `${presentYear}-${presentMonth + 1}-31`;
          console.log(LastDayMonth);
      }
      else {
          FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
          console.log(FirstDayMonth);
          LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
          console.log(LastDayMonth);
      }
      }



      const result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
          },
          {
              $match: {
                  creationDate: {
                      $lte: LastDayMonth,
                      $gte: FirstDayMonth
                  },

              }
          },

          {
              $group: {
                  _id: '$creationDate',
                  // Total:{$add:['$TotalCost','$PaidAmount']},                
                  onCondition: { $sum: "$onCondition" },
                  PayableAmount: { $sum: "$PayableAmount" },
                  TotalCost: { $sum: "$TotalCost" },
              }

          },


          {
              $addFields: { week_day: '$_id' }
          },
          {
              $sort: { week_day: 1 }
          },

          {
              $project: {
                  _id: 0,

              }
          },

      ]
      )


      res.status(200).send(result)
  }
  else if (date === "Yearly" && department == "Booked") {
      const presentTime = new Date(calender)

      const presentYear = presentTime.getFullYear()
      console.log(presentYear)
      const FirstDayMonth = `${presentYear}-01`
      console.log(FirstDayMonth)
      const LastDayMonth = `${presentYear}-12`
      console.log(LastDayMonth)

      const result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } }
          },
          {
              $match: {
                  creationDate: {
                      $lte: LastDayMonth,
                      $gte: FirstDayMonth
                  },
              }
          },

          {
              $group: {
                  _id: '$creationDate',
                  PaidAmount: { $sum: "$PaidAmount" },               
                  onCondition: { $sum: "$onCondition" },
                  PayableAmount: { $sum: "$PayableAmount" }
              }

          },


          {
              $addFields: { week_day: '$_id' }
          },
          {
              $sort: { week_day: 1 }
          },

          {
              $project: {
                  _id: 0,

              }
          },

      ]
      )


      res.status(200).send(result)
  }
  else if (date === "Yearly" && department == "Delivered") {
      const presentTime = new Date(calender)


      const presentYear = presentTime.getFullYear()
      console.log(presentYear)
      const FirstDayMonth = `${presentYear}-01`
      console.log(FirstDayMonth)
      const LastDayMonth = `${presentYear}-12`
      console.log(LastDayMonth)


      const result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } } }
          },
          {
              $match: {
                  creationDate: {
                      $lte: LastDayMonth,
                      $gte: FirstDayMonth
                  },
              }
          },

          {
              $group: {
                  _id: '$creationDate',
                  onCondition: { $sum: "$onCondition" },
                  PayableAmount: { $sum: "$PayableAmount" },
                  TotalCost: { $sum: "$TotalCost" },
              }

          },


          {
              $addFields: { week_day: '$_id' }
          },
          {
              $sort: { week_day: 1 }
          },

          {
              $project: {
                  _id: 0,

              }
          },

      ]
      )


      res.status(200).send(result)
  }
  else if (date === "Weekly" && department == "Booked") {
    const today = moment();
    console.log(today.format());

    // const momentTryFirst = moment(today).subtract(1, "week").startOf("week").format("YYYY-MM-DD")
    const momentTryLast = moment(today).subtract(1, "week").endOf("week").format("YYYY-MM-DD")

    // console.log(momentTryFirst)
    console.log(momentTryLast);
    const test = moment().day('friday').format("YYYY-MM-DD")
    console.log(test)


      const result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }
          },
          {
              $match: {
                  creationDate: {
                      $lte:test,
                      $gte: momentTryLast
                  },

              }
          },

          {
              $group: {
                  _id: '$creationDate',
                  // Total:{$add:['$TotalCost','$PaidAmount']},                
                  PaidAmount: { $sum: "$PaidAmount" },               
                  onCondition: { $sum: "$onCondition" },
                  PayableAmount: { $sum: "$PayableAmount" }

              }

          },


          {
              $addFields: { week_day: '$_id' }
          },
          {
              $sort: { week_day: 1 }
          },

          {
              $project: {
                  _id: 0,

              }
          },

      ]
      )


      res.status(200).send(result)
  }
  else{
    const today = moment();
    console.log(today.format());

    // const momentTryFirst = moment(today).subtract(1, "week").startOf("week").format("YYYY-MM-DD")
    const momentTryLast = moment(today).subtract(1, "week").endOf("week").format("YYYY-MM-DD")

    // console.log(momentTryFirst)
    console.log(momentTryLast);
    const test = moment().day('friday').format("YYYY-MM-DD")
    console.log(test)

      const result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
          },
          {
              $match: {
                  creationDate: {
                      $lte: test,
                      $gte: momentTryLast
                  },
              }
          },

          {
              $group: {
                  _id: '$creationDate',
                  onCondition: { $sum: "$onCondition" },
                  PayableAmount: { $sum: "$PayableAmount" },
                  TotalCost: { $sum: "$TotalCost" },
              }

          },


          {
              $addFields: { week_day: '$_id' }
          },
          {
              $sort: { week_day: 1 }
          },

          {
              $project: {
                  _id: 0,

              }
          },

      ]
      )


      res.status(200).send(result)
  }
}

const AdminDashCardAll = async (req, res) => {
  const calender = req.params.calender;
  const date = req.params.date;
  console.log(calender);
  if (date === "Monthly") {
    const presentTime = new Date(calender);

    const presentMonth = presentTime.getMonth();
    console.log(presentMonth);
    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    var FirstDayMonth;
    var LastDayMonth;
    if (presentMonth < 9) {
      if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
        FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-0${presentMonth + 1}-31`;
        console.log(LastDayMonth);
    }
    else {
        FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
        console.log(LastDayMonth);
    }
    } else {
      if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
        FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-${presentMonth + 1}-31`;
        console.log(LastDayMonth);
    }
    else {
        FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
        console.log(LastDayMonth);
    }
    }
    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          Total: { $sum: 1 },
        },
      },
      {
        $addFields: { status: "$_id" },
      },

      {
        $sort: {
          status: 1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    if (result.length === 0 || result === undefined) {
      return res.status(400).json({ message: "There is no data To Show" });
    } else {
      return res.status(200).send(result);
    }
  } else if(date==='Yearly') {
    const presentTime = new Date(calender);

    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    const FirstDayMonth = `${presentYear}-01`;
    console.log(FirstDayMonth);
    const LastDayMonth = `${presentYear}-12`;
    console.log(LastDayMonth);

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          Total: { $sum: 1 },
        },
      },

      {
        $addFields: { status: "$_id" },
      },

      {
        $sort: {
          status: 1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    if (result.length === 0 || result === undefined) {
      return res.status(400).json({ message: "There is no data To Show" });
    } else {
      return res.status(200).send(result);
    }
  }
  else{

    const today = moment();
        console.log(today.format());

        // const momentTryFirst = moment(today).subtract(1, "week").startOf("week").format("YYYY-MM-DD")
        const momentTryLast = moment(today).subtract(1, "week").endOf("week").format("YYYY-MM-DD")

        // console.log(momentTryFirst)
        console.log(momentTryLast);
        const test = moment().day('friday').format("YYYY-MM-DD")
        console.log(test)
    const result = await Parcel.aggregate([
      {
        $facet: {
          BookedSent: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: test,
                  $gte: momentTryLast,
                },
              },
            },
            {
              $group: {
                _id: "$status",
                Total: { $sum: 1 },
              },
            },
      
            {
              $addFields: { status: "$_id" },
            },
      
            {
              $sort: {
                status: 1,
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ],
          RecievedDelivered: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: test,
                  $gte: momentTryLast,
                },
                
              },
            },
            {
              $group: {
                _id: "$status",
                Total: { $sum: 1 },
              },
            },
      
            {
              $addFields: { status: "$_id" },
            },
      
            {
              $sort: {
                status: 1,
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ],
        },
      },
    ]);
    for (var i = 0; i < result[0].RecievedDelivered.length; i++) {
      result[0].BookedSent.push(result[0].RecievedDelivered[i]);
    }
    if (
      result[0].BookedSent.length === 0 ||
      result[0].BookedSent === undefined
    ) {
      res.status(400).json({ message: "There is no data to show" });
    } else {
      return res.status(200).send(result[0].BookedSent);
    }
  }
};

const AdminDashCardBranch = async (req, res) => {
  const calender = req.params.calender;
  console.log(calender);
  const date = req.params.date;
  const branchId = toId(req.params.branch);
  console.log(branchId);
  // const status = req.params.status
  if (date === "Monthly") {
    const presentTime = new Date(calender);
    const presentMonth = presentTime.getMonth();
    console.log(presentMonth);
    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    var FirstDayMonth;
    var LastDayMonth;
    if (presentMonth < 9) {
      if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
        FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-0${presentMonth + 1}-31`;
        console.log(LastDayMonth);
    }
    else {
        FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
        console.log(LastDayMonth);
    }
    } else {
      if (presentMonth === 0 || presentMonth === 2 || presentMonth === 4 || presentMonth === 6 || presentMonth === 7 || presentMonth === 9 || presentMonth === 11) {
        FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-${presentMonth + 1}-31`;
        console.log(LastDayMonth);
    }
    else {
        FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
        console.log(FirstDayMonth);
        LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
        console.log(LastDayMonth);
    }
    }
    const result = await Parcel.aggregate([
      {
        $facet: {
          BookedSent: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: LastDayMonth,
                  $gte: FirstDayMonth,
                },
                BookedFrom: branchId,
                $or: [{ status: "Booked" }, { status: "Sent" }],
              },
            },
            {
              $group: {
                _id: "$status",
                Total: { $sum: 1 },
              },
            },
            {
              $addFields: { status: "$_id" },
            },
            // {
            //     $sort: { week_day: 1 }
            // },

            {
              $project: {
                _id: 0,
              },
            },
          ],
          RecievedDelivered: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: LastDayMonth,
                  $gte: FirstDayMonth,
                },
                SendTo: branchId,
                $or: [{ status: "Delivered" }, { status: "Recieved" }],
              },
            },
            {
              $group: {
                _id: "$status",
                Total: { $sum: 1 },
              },
            },
            {
              $addFields: { status: "$_id" },
            },
            // {
            //     $sort: { week_day: 1 }
            // },

            {
              $project: {
                _id: 0,
              },
            },
          ],
        },
      },
    ]);
    for (var i = 0; i < result[0].RecievedDelivered.length; i++) {
      result[0].BookedSent.push(result[0].RecievedDelivered[i]);
    }
    if (
      result[0].BookedSent.length === 0 ||
      result[0].BookedSent === undefined
    ) {
      res.status(400).json({ message: "There is no data to show" });
    } else {
      return res.status(200).send(result[0].BookedSent);
    }
  } else if(date ==='Yearly') {
    const presentTime = new Date(calender);

    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    const FirstDayMonth = `${presentYear}-01`;
    console.log(FirstDayMonth);
    const LastDayMonth = `${presentYear}-12`;
    console.log(LastDayMonth);
    const result = await Parcel.aggregate([
      {
        $facet: {
          BookedSent: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: LastDayMonth,
                  $gte: FirstDayMonth,
                },
                BookedFrom: branchId,
                $or: [{ status: "Booked" }, { status: "Sent" }],
              },
            },
            {
              $group: {
                _id: "$status",
                Total: { $sum: 1 },
              },
            },
            {
              $addFields: { status: "$_id" },
            },

            {
              $project: {
                _id: 0,
              },
            },
          ],
          RecievedDelivered: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: LastDayMonth,
                  $gte: FirstDayMonth,
                },
                SendTo: branchId,
                $or: [{ status: "Delivered" }, { status: "Recieved" }],
              },
            },
            {
              $group: {
                _id: "$status",
                Total: { $sum: 1 },
              },
            },
            {
              $addFields: { status: "$_id" },
            },

            {
              $project: {
                _id: 0,
              },
            },
          ],
        },
      },
    ]);
    for (var i = 0; i < result[0].RecievedDelivered.length; i++) {
      result[0].BookedSent.push(result[0].RecievedDelivered[i]);
    }
    if (
      result[0].BookedSent.length === 0 ||
      result[0].BookedSent === undefined
    ) {
      res.status(400).json({ message: "There is no data to show" });
    } else {
      return res.status(200).send(result[0].BookedSent);
    }
  }
  else{

    const today = moment();
        console.log(today.format());

        // const momentTryFirst = moment(today).subtract(1, "week").startOf("week").format("YYYY-MM-DD")
        const momentTryLast = moment(today).subtract(1, "week").endOf("week").format("YYYY-MM-DD")

        // console.log(momentTryFirst)
        console.log(momentTryLast);
        const test = moment().day('friday').format("YYYY-MM-DD")
        console.log(test)
    const result = await Parcel.aggregate([
      {
        $facet: {
          BookedSent: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: test,
                  $gte: momentTryLast,
                },
                BookedFrom: branchId,
                $or: [{ status: "Booked" }, { status: "Sent" }],
              },
            },
            {
              $group: {
                _id: "$status",
                Total: { $sum: 1 },
              },
            },
            {
              $addFields: { status: "$_id" },
            },
            // {
            //     $sort: { week_day: 1 }
            // },

            {
              $project: {
                _id: 0,
              },
            },
          ],
          RecievedDelivered: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: test,
                  $gte: momentTryLast,
                },
                SendTo: branchId,
                $or: [{ status: "Delivered" }, { status: "Recieved" }],
              },
            },
            {
              $group: {
                _id: "$status",
                Total: { $sum: 1 },
              },
            },
            {
              $addFields: { status: "$_id" },
            },
            // {
            //     $sort: { week_day: 1 }
            // },

            {
              $project: {
                _id: 0,
              },
            },
          ],
        },
      },
    ]);
    for (var i = 0; i < result[0].RecievedDelivered.length; i++) {
      result[0].BookedSent.push(result[0].RecievedDelivered[i]);
    }
    if (
      result[0].BookedSent.length === 0 ||
      result[0].BookedSent === undefined
    ) {
      res.status(400).json({ message: "There is no data to show" });
    } else {
      return res.status(200).send(result[0].BookedSent);
    }
  }
};

const AdminDashCardBranchSend = async (req, res) => {
  const branchId = toId(req.params.branch);
  // console.log(branchId)
  const result = await Parcel.aggregate([
    {
      $match: {
        SendTo: branchId,
      },
    },
    {
      $group: {
        _id: "$status",
        Total: { $sum: 1 },
      },
    },
  ]);
  return res.status(200).send(result);
};

const AdminDashSend = async (req, res) => {
  const calender = req.params.calender;
  const date = req.params.date;
  const branchId = toId(req.params.branchId);
  console.log(branchId);
  if (date === "Monthly") {
    const presentTime = new Date(calender);

    const presentMonth = presentTime.getMonth();
    console.log(presentMonth);
    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    var FirstDayMonth;
    var LastDayMonth;
    if (presentMonth < 9) {
      FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
      console.log(FirstDayMonth);
      LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
      console.log(LastDayMonth);
    } else {
      FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
      console.log(FirstDayMonth);
      LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
      console.log(LastDayMonth);
    }

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          SendTo: branchId,
        },
      },

      {
        $group: {
          _id: "$creationDate",
          // Total:{$add:['$TotalCost','$PaidAmount']},
          Booked: { $sum: "$TotalCost" },
          PaidAmount: { $sum: "$PaidAmount" },
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  } else {
    const presentTime = new Date(calender);

    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    const FirstDayMonth = `${presentYear}-01`;
    console.log(FirstDayMonth);
    const LastDayMonth = `${presentYear}-12`;
    console.log(LastDayMonth);

    const result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $lte: LastDayMonth,
            $gte: FirstDayMonth,
          },
          SendTo: branchId,
        },
      },

      {
        $group: {
          _id: "$creationDate",
          Booked: { $sum: "$TotalCost" },
          PaidAmount: { $sum: "$PaidAmount" },
        },
      },

      {
        $addFields: { week_day: "$_id" },
      },
      {
        $sort: { week_day: 1 },
      },

      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).send(result);
  }
};

const getUniqueParcel = async (req, res) => {
  try {
    const parcels = await Parcel.findOne({ SearchId: req.params.parcelid });
    console.log(parcels);
    if (!parcels) return res.status(400).json({ message: "Parcel Not Found" });
    const result = await Parcel.findById({ _id: parcels._id }).populate(
      "BookedFrom SendTo",
      "branch"
    );

    return res.status(200).send({
      parcel: result,
    });
  } catch (err) {
    return res.status(400).json({ messag: "The Parcel Does not Exist " });
  }
};

// ----------------
const Test = async (req, res) => {
  const calender = req.params.calender;
  const date = req.params.date;
  const branch = req.params.branch;
  if (date === "Monthly") {
    const presentTime = new Date(calender);

    const presentMonth = presentTime.getMonth();
    console.log(presentMonth);
    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    let FirstDayMonth;
    let LastDayMonth;
    if (presentMonth < 9) {
      FirstDayMonth = `${presentYear}-0${presentMonth + 1}-01`;
      console.log(FirstDayMonth);
      LastDayMonth = `${presentYear}-0${presentMonth + 1}-30`;
      console.log(LastDayMonth);
    } else {
      FirstDayMonth = `${presentYear}-${presentMonth + 1}-01`;
      console.log(FirstDayMonth);
      LastDayMonth = `${presentYear}-${presentMonth + 1}-30`;
      console.log(LastDayMonth);
    }

    const result = await Parcel.aggregate([
      {
        $facet: {
          showData: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: LastDayMonth,
                  $gte: FirstDayMonth,
                },
                BookedFrom: toId(branch),
              },
            },

            {
              $group: {
                _id: "$creationDate",

                PaidAmount: { $sum: "$PaidAmount" },
                PayableAmount: { $sum: "$PayableAmount" },
              },
            },

            {
              $addFields: { week_day: "$_id" },
            },
            {
              $sort: { week_day: 1 },
            },

            {
              $project: {
                _id: 0,
              },
            },
          ],

          showPayable: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: LastDayMonth,
                  $gte: FirstDayMonth,
                },
                status: "Delivered",
                SendTo: toId(branch),
              },
            },

            {
              $group: {
                _id: "$creationDate",
                PayableAmount: { $sum: "$PayableAmount" },
              },
            },

            {
              $addFields: { week_day: "$_id" },
            },
            {
              $sort: { week_day: 1 },
            },

            {
              $project: {
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    for (let i = 0; i < result[0].showData.length; i++) {
      for (let j = 0; j < result[0].showPayable.length; j++) {
        if (
          result[0].showData[i].week_day === result[0].showPayable[j].week_day
        ) {
          result[0].showData[i].Delivered =
            result[0].showPayable[j].PayableAmount;
        } else {
          result[0].showData[i].Delivered = 0;
        }
      }
    }
    res.status(200).send(result[0].showData);
  } else {
    const presentTime = new Date(calender);

    const presentYear = presentTime.getFullYear();
    console.log(presentYear);
    const FirstDayMonth = `${presentYear}-01`;
    console.log(FirstDayMonth);
    const LastDayMonth = `${presentYear}-12`;
    console.log(LastDayMonth);

    const result = await Parcel.aggregate([
      {
        $facet: {
          showData: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
              },
            },

            {
              $match: {
                creationDate: {
                  $lte: LastDayMonth,
                  $gte: FirstDayMonth,
                },
                BookedFrom: toId(branch),
              },
            },

            {
              $group: {
                _id: "$creationDate",

                PaidAmount: { $sum: "$PaidAmount" },
                PayableAmount: { $sum: "$PayableAmount" },
              },
            },

            {
              $addFields: { week_day: "$_id" },
            },
            {
              $sort: { week_day: 1 },
            },

            {
              $project: {
                _id: 0,
              },
            },
          ],

          showPayable: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $lte: LastDayMonth,
                  $gte: FirstDayMonth,
                },
                status: "Delivered",
                SendTo: toId(branch),
              },
            },

            {
              $group: {
                _id: "$creationDate",
                PayableAmount: { $sum: "$PayableAmount" },
              },
            },

            {
              $addFields: { week_day: "$_id" },
            },
            {
              $sort: { week_day: 1 },
            },

            {
              $project: {
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    for (let i = 0; i < result[0].showData.length; i++) {
      for (let j = 0; j < result[0].showPayable.length; j++) {
        if (
          result[0].showData[i].week_day === result[0].showPayable[j].week_day
        ) {
          result[0].showData[i].Delivered =
            result[0].showPayable[j].PayableAmount;
        } else {
          result[0].showData[i].Delivered = 0;
        }
      }
    }
    res.status(200).send(result[0].showData);
  }
};

// ----------------
const generateText = async (req) => {
  // const branch = await Branch.findOne({ _id: toId(req.body.BookedFrom) });
  const parcel = await Parcel.findOne({
    SendTo: toId(req.body.SendTo),
    BookedFrom: toId(req.body.BookedFrom)
  }).populate("SendTo BookedFrom", "branch");
  //const user = await User.findOne({ _id: toId(req.body.bookedbyId) });
  // console.log(parcel)
 console.log(req.body.referance);
  if ((req.body.status === "Booked"&&(req.body.referance===undefined||req.body.referance===null))&&process.env.MESSAGEBOOKEDSENDER==='TRUE'&&process.env.MESSAGEBOOKEDRECIEVER==='TRUE') {
    const data = []
    const obj = {}
    const obj1 = {}
    let from = req.body.SenderNumber
    let to = req.body.RecieverNumber
    
    let messageTo = utf8.encode(`প্রিয় ${req.body.RecieverName}, আপনার নামে ${parcel.BookedFrom.branch} শাখা থেকে জনাব/জনাবা ${req.body.SenderName} একটি পার্সেল  ${parcel.SendTo.branch} শাখার উদ্দেশ্যে নিবন্ধিত করেছেন। যার  নিবন্ধন নাম্বার : ${req.body.SearchId} । পার্সেলটি ${parcel.SendTo.branch} শাখাতে পৌঁছা মাত্র আপনাকে পুনরায় অবগত করা হবে। পার্সেলটির অবস্থা জানতে আপনি এই লিংকটি ব্যবহার করতে পারেন :  https://courier-service-pro.herokuapp.com/track-parcel?id=${req.body.SearchId} ধন্যবাদ, কখ কুরিয়ার সার্ভিস লিমিটেড।`)
    // let messageTo = utf8.encode(`প্রিয় ${req.body.RecieverName}, আপনার জন্য একটি পণ্য নিবন্ধন করা হয়েছে ,যার নিবন্ধন নং  ${req.body.SearchId} । পণ্যটি আপনার ${parcel.SendTo.branch} শাখায় যথা সময়ে পৌঁছে  দেওয়া হবে ।  ধন্যবাদ । `)
    // let messageFrom =utf8.encode( `প্রিয় ${req.body.SenderName}, আপনার পণ্যটি ${parcel.BookedFrom.branch} শাখায় নিবন্ধন করা হয়েছে । যার নিবন্ধন নং ${req.body.SearchId}. পণ্যটি ${parcel.SendTo.branch} শাখায় পৌঁছে দেওয়া হলে পরবর্তীতে আপনাকে জানানো হবে ।  ধন্যবাদ । `)
    let messageFrom =utf8.encode( `প্রিয়${req.body.SenderName}, আপনার পার্সেল টি ${parcel.SendTo.branch} শাখার উদ্দেশ্যে জনাব/জনাবা ${req.body.RecieverName} এর নামে${parcel.BookedFrom.branch} শাখাতে সঠিক ভাবে  নিবন্ধিত হয়েছে। যার  নিবন্ধন নাম্বার : ${req.body.SearchId}। পার্সেলটির অবস্থা জানতে আপনি এই লিংকটি ব্যবহার করতে পারেন : https://courier-service-pro.herokuapp.com/track-parcel?id=${req.body.SearchId} ধন্যবাদ, কখ কুরিয়ার সার্ভিস লিমিটেড। `)
    obj["Number"] = from
    obj["message"] = messageFrom
    obj1["Number"] = to
    obj1["message"] = messageTo
    data.push(obj, obj1)
    // console.log(data)

    return { data }

  }
  else if ((req.body.status === "Booked"&&(req.body.referance!==undefined||req.body.referance!==null))&&process.env.MESSAGEBOOKEDSENDER==='TRUE'&&process.env.MESSAGEBOOKEDRECIEVER==='TRUE') {
    const data = []
    const obj = {}
    const obj1 = {}
    let from = req.body.SenderNumber
    let to = req.body.RecieverNumber
    let messageTo = "Test to sender"
    // utf8.encode(`প্রিয় ${req.body.RecieverName}, আপনার জন্য একটি পণ্য নিবন্ধন করা হয়েছে ,যার নিবন্ধন নং  ${req.body.SearchId} । পণ্যটি আপনার ${parcel.SendTo.branch} শাখায় যথা সময়ে পৌঁছে  দেওয়া হবে ।  ধন্যবাদ । `)
    let messageFrom = "Test To Reciever"
    // utf8.encode( `প্রিয় ${req.body.SenderName}, আপনার পণ্যটি ${parcel.BookedFrom.branch} শাখায় নিবন্ধন করা হয়েছে । যার নিবন্ধন নং ${req.body.SearchId}. পণ্যটি ${parcel.SendTo.branch} শাখায় পৌঁছে দেওয়া হলে পরবর্তীতে আপনাকে জানানো হবে ।  ধন্যবাদ । `)
    obj["Number"] = from
    obj["message"] = messageFrom
    obj1["Number"] = to
    obj1["message"] = messageTo
    data.push(obj, obj1)
    // console.log(data)

    return { data }

  }
  else if((req.body.status === "Booked"&&(req.body.referance===undefined||req.body.referance===null))&&process.env.MESSAGEBOOKEDSENDER==='FALSE'&&process.env.MESSAGEBOOKEDRECIEVER==='TRUE'){
    const data = []
    const obj1 = {}
    let to = req.body.RecieverNumber
    //let messageTo = utf8.encode(`প্রিয় ${req.body.RecieverName}, আপনার জন্য একটি পণ্য নিবন্ধন করা হয়েছে ,যার নিবন্ধন নং  ${req.body.SearchId} । পণ্যটি আপনার ${parcel.SendTo.branch} শাখায় যথা সময়ে পৌঁছে  দেওয়া হবে ।  ধন্যবাদ । `)
    let messageTo = utf8.encode(`প্রিয় ${req.body.RecieverName}, আপনার নামে ${parcel.BookedFrom.branch} শাখা থেকে জনাব/জনাবা ${req.body.SenderName} একটি পার্সেল  ${parcel.SendTo.branch} শাখার উদ্দেশ্যে নিবন্ধিত করেছেন। যার  নিবন্ধন নাম্বার : ${req.body.SearchId}। পার্সেলটি ${parcel.SendTo.branch} শাখাতে পৌঁছা মাত্র আপনাকে পুনরায় অবগত করা হবে। পার্সেলটির অবস্থা জানতে আপনি এই লিংকটি ব্যবহার করতে পারেন : https://courier-service-pro.herokuapp.com/track-parcel?id=${req.body.SearchId} ধন্যবাদ, কখ কুরিয়ার সার্ভিস লিমিটেড।`)
    obj1["Number"] = to
    obj1["message"] = messageTo
    data.push( obj1)
    // console.log(data)

    return { data }

  }
  else if((req.body.status === "Booked"&&(req.body.referance!==undefined||req.body.referance!==null))&&process.env.MESSAGEBOOKEDSENDER==='FALSE'&&process.env.MESSAGEBOOKEDRECIEVER==='TRUE'){
    const data = []
    const obj1 = {}
    let to = req.body.RecieverNumber
    let messageTo = "Testing Reciever"
    // utf8.encode(`প্রিয় ${req.body.RecieverName}, আপনার জন্য একটি পণ্য নিবন্ধন করা হয়েছে ,যার নিবন্ধন নং  ${req.body.SearchId} । পণ্যটি আপনার ${parcel.SendTo.branch} শাখায় যথা সময়ে পৌঁছে  দেওয়া হবে ।  ধন্যবাদ । `)

    obj1["Number"] = to
    obj1["message"] = messageTo
    data.push( obj1)
    // console.log(data)

    return { data }

  }
  else if((req.body.status === "Booked"&&(req.body.referance===undefined||req.body.referance===null))&&process.env.MESSAGEBOOKEDSENDER==='TRUE'&&process.env.MESSAGEBOOKEDRECIEVER==='FALSE'){
    const data = []
     const obj = {}
   // const obj1 = {}
    let from = req.body.SenderNumber
 
    //let messageFrom =utf8.encode( `প্রিয় ${req.body.SenderName}, আপনার পণ্যটি ${parcel.BookedFrom.branch} শাখায় নিবন্ধন করা হয়েছে । যার নিবন্ধন নং ${req.body.SearchId}. পণ্যটি ${parcel.SendTo.branch} শাখায় পৌঁছে দেওয়া হলে পরবর্তীতে আপনাকে জানানো হবে ।  ধন্যবাদ । `)
    let messageFrom =utf8.encode( `প্রিয়${req.body.SenderName}, আপনার পার্সেল টি ${parcel.SendTo.branch} শাখার উদ্দেশ্যে জনাব/জনাবা ${req.body.RecieverName} এর নামে${parcel.BookedFrom.branch} শাখাতে সঠিক ভাবে  নিবন্ধিত হয়েছে। যার  নিবন্ধন নাম্বার : ${req.body.SearchId}। পার্সেলটির অবস্থা জানতে আপনি এই লিংকটি ব্যবহার করতে পারেন :  https://courier-service-pro.herokuapp.com/track-parcel?id=${req.body.SearchId} ধন্যবাদ, কখ কুরিয়ার সার্ভিস লিমিটেড। `)

     obj["Number"] = from
     obj["message"] = messageFrom
    //obj1["Number"] = to
    //obj1["message"] = messageTo
    data.push( obj)
    // console.log(data)

    return { data }
  }
  else if((req.body.status === "Booked"&&(req.body.referance!==undefined||req.body.referance!==null))&&process.env.MESSAGEBOOKEDSENDER==='TRUE'&&process.env.MESSAGEBOOKEDRECIEVER==='FALSE'){
    const data = []
     const obj = {}
   // const obj1 = {}
    let from = req.body.SenderNumber
 
    let messageFrom ="Testing Sender"
    // utf8.encode( `প্রিয় ${req.body.SenderName}, আপনার পণ্যটি ${parcel.BookedFrom.branch} শাখায় নিবন্ধন করা হয়েছে । যার নিবন্ধন নং ${req.body.SearchId}. পণ্যটি ${parcel.SendTo.branch} শাখায় পৌঁছে দেওয়া হলে পরবর্তীতে আপনাকে জানানো হবে ।  ধন্যবাদ । `)

     obj["Number"] = from
     obj["message"] = messageFrom
    //obj1["Number"] = to
    //obj1["message"] = messageTo
    data.push( obj)
    // console.log(data)

    return { data }
  }
  else if(((req.body.status === "Booked"&&(req.body.referance===undefined||req.body.referance===null))&&process.env.MESSAGEBOOKEDSENDER==='FALSE'&&process.env.MESSAGEBOOKEDRECIEVER==='FALSE')){
    data = []
    return { data }
  }
  else if(((req.body.status === "Booked"&&(req.body.referance!==undefined||req.body.referance!==null))&&process.env.MESSAGEBOOKEDSENDER==='FALSE'&&process.env.MESSAGEBOOKEDRECIEVER==='FALSE')){
    data = []
    return { data }
  }
   else if (req.body.status === "Recieved"&&process.env.MESSAGERECIEVED==='TRUE') {
    const data = []
    const obj = {}
    let to = req.body.RecieverNumber
    console.log("Reciver send", to);
    // let message = utf8.encode(`প্রিয় ${req.body.RecieverName},আপনার পণ্যটি   ${parcel.BookedFrom.branch} শাখায় নিবন্ধন  করা হয়েছে । পণ্যটি এখন  ${parcel.SendTo.branch} শাখায় আছে । 
    // আপনাকে পণ্যটি সংগ্রহ করার জন্য বিনীত  অনুরোধ  করা হচ্ছে ।  ধন্যবাদ । `)
    let message = utf8.encode(`প্রিয় ${req.body.RecieverName}, আপনার নামে ${parcel.BookedFrom.branch} শাখা থেকে জনাব/জনাবা ${req.body.SenderName} এর পাঠানো পার্সেলটি  ${parcel.SendTo.branch} শাখাতে পৌঁছে গেছে। যার  নিবন্ধন নাম্বার : ${req.body.SearchId}। আপনি এখন  ${parcel.SendTo.branch} শাখা থেকে পার্সেলটি সংগ্রহ করতে পারেন। পার্সেল সংগ্রহের জন্য অবশ্যই আপনার এই মোবাইল ফোন টি সাথে নিয়ে আসবেন। ধন্যবাদ, কখ কুরিয়ার সার্ভিস লিমিটেড।`)
    obj["Number"] = to
    obj["message"] = message
    data.push(obj)
    return { data }

  } 
  else if(req.body.status === "Recieved"&&process.env.MESSAGERECIEVED==='FALSE'){
    data = []
    console.log("Reciver Failed");

    return { data }
  }
  else if (req.body.status === "Delivered"&&process.env.MESSAGEDELIVERED==="TRUE") {
    const data = []
    const obj = {}
    let from = req.body.SenderNumber
    console.log("Delivered send");
    let messageFrom = utf8.encode(`প্রিয় ${req.body.SenderName} , আপনার ${parcel.BookedFrom.branch} শাখাতে নিবন্ধিত পার্সেল টি আজ জনাব/জনাবা ${req.body.RecieverName} ${parcel.SendTo.branch} শাখা থেকে সংগ্রহ করেছেন।  যার  নিবন্ধন নাম্বার : ${req.body.SearchId}। ধন্যবাদ, কখ কুরিয়ার সার্ভিস লিমিটেড।`)
    //let messageFrom = utf8.encode(`প্রিয় ${req.body.SenderName}, আপনার পণ্যের নিবন্ধন  নং ${req.body.SearchId}, আপনি  ${parcel.BookedFrom.branch} শাখায় বুক করেছিলেন। আপনার পণ্যটি সফলভাবে ${req.body.RecieverName} কে ${parcel.SendTo.branch} শাখায় পৌঁছে  দেওয়া হয়েছে ।  ধন্যবাদ `)
    obj["Number"] = from
    obj["message"] = messageFrom
    // obj1["Number"] = to
    // obj1["message"] = messageTo
    data.push(obj)
    // console.log(data)

    return { data }
  }
  else if(req.body.status === "Delivered"&&process.env.MESSAGEDELIVERED==="FALSE"){
    data = []
    console.log("Delivered Failed");

    return { data }
  }
  else {
    data = []
    console.log("else failed");

    return { data }
  }
}
// ----------------
const sendText = async (req, res) => {
  // console.log(req.body);
  let {data} = await  generateText(req)
  if(data ==='undefined' ||data.length===0) return res.status(400).json({message:"Nothing to send"});
  // console.log(data[0]);
  // console.log(data.length)
  // console.log(data[1]);
  for (var i =0;i<data.length;i++){
    console.log(`test ${i}` )
    var config = {
      method: 'get',
      url: `https://api.mobireach.com.bd/SendTextMessage?Username=coredevs&Password=Core.2021@&From=Coredevs&To=${data[i].Number}&Message=${data[i].message}`,
      headers: { }
    };
  
    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  
  }
  return res.status(200).json({message:"SENT"})
  

};




const BookedSend = async (req, res) => {
  const time = req.params.time;
  const status = req.params.status;
  const branchId = req.params.branchId;
  console.log(branchId);
  const testing = toId(branchId);
  console.log(testing);
  var d = new Date(time);
  d = d.getTime();
  d = new Date(d).toJSON();
  console.log(d);
  var test = d.split("T");
  console.log(test);

  var result;
  if (status === "Booked") {
    result = await Parcel.aggregate([
      {
        $facet: {
          BookedMonthly: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                status: status,
                creationDate: test[0],
                BookedFrom: testing,
              },
            },

            {
              $group: {
                _id: null,
                // Booked: { $sum: 1 },
                data: { $push: "$$ROOT" },
              },
            },

            {
              $project: {
                _id: 0,
                data: 1,
                Booked: 1,
              },
            },
          ],
          SendMonthly: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
              },
            },
            {
              $match: {
                status: status,
                creationDate: test[0],
                SendTo: testing,
              },
            },

            {
              $group: {
                _id: null,
                // Booked: { $sum: 1 },
                data: { $push: "$$ROOT" },
              },
            },
            {
              $project: {
                _id: 0,
                data: 1,
                Booked: 1,
              },
            },
          ],
        },
      },
    ]);
    var parcel;
    // const Booked  = result[0].Booked
    if (
      (result[0].BookedMonthly.length < 1 ||
        result[0].BookedMonthly === undefined) &&
      (result[0].SendMonthly.length < 1 || result[0].SendMonthly === undefined)
    ) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      // return res.status(200).send(result)
      if (
        result[0].SendMonthly.length < 1 ||
        result[0].SendMonthly === undefined
      ) {
        result = result[0].BookedMonthly[0].data;
        const promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
        // return res.status(200).send(result[0].BookedMonthly[0].data)
      } else if (
        result[0].BookedMonthly.length < 1 ||
        result[0].BookedMonthly === undefined
      ) {
        result = result[0].SendMonthly[0].data;
        const promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      }

      // return res.status(200).send(result[0].SendMonthly[0].data)
      else {
        result = result[0].BookedMonthly[0].data.concat(
          result[0].SendMonthly[0].data
        );
        const promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
      }
      return res.status(200).send(results);
    }
  } else if (status === "Recieved") {
    result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          status: status,
          creationDate: test[0],
          BookedFrom: testing,
        },
      },

      {
        $group: {
          _id: null,
          Recieved: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          Recieved: 1,
        },
      },
    ]);

    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      const promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          var parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );

      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }

      return res.status(200).send(results);
    }
  } else if (status === "Sent") {
    result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          status: status,
          creationDate: test[0],
          BookedFrom: testing,
        },
      },

      {
        $group: {
          _id: null,
          Sent: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          Sent: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      const promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          var parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );

      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }

      return res.status(200).send(results);
    }
  } else if (status === "Delivered") {
    result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          status: status,
          creationDate: test[0],
          BookedFrom: testing,
        },
      },

      {
        $group: {
          _id: null,
          Delivered: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          Booked: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      const promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          var parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );

      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }

      return res.status(200).send(results);
    }
  } else {
    result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
          },
        },
      },
      {
        $match: {
          status: "Sent",
          creationDate: test[0],
          BookedFrom: testing,
        },
      },

      {
        $group: {
          _id: null,
          Upcoming: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          Upcoming: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      const promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          var parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );

      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }

      return res.status(200).send(results);
    }
  }
};
const SubAdminBookedSend = async (req, res) => {
  const status = req.params.status;
  const calender = req.params.calender;
  const presentTime = new Date(calender);
  let branch = req.params.branch
  if(branch !== 'all'){
     branch = toId(req.params.branch);
  }
  else{
    branch = req.params.branch
  }
  
  
  var presentMonth = presentTime.getMonth();

  var presentYear = presentTime.getFullYear();

  var presentDate = presentTime.getDate();

  // if (presentMonth < 9 && presentDate < 10) {
  //   LatestDayMonth = `${presentYear}-0${presentMonth + 1}-0${presentDate}`;
  // } else if (presentMonth < 9 && presentDate > 10) {
  //   LatestDayMonth = `${presentYear}-0${presentMonth + 1}-${presentDate}`;
  // } else if (presentMonth >= 9 && presentDate > 10) {
  //   LatestDayMonth = `${presentYear}-${presentMonth + 1}-${presentDate}`;
  // } else {
  //   LatestDayMonth = `${presentYear}-${presentMonth + 1}-${presentDate}`;
  // }

  presentMonth = presentMonth + 1
  if(presentMonth < 10)
    presentMonth = `0${presentMonth}`
  if(presentDate < 10)
    presentDate = `0${presentDate}`
  LatestDayMonth = `${presentYear}-${presentMonth}-${presentDate}`;


  if (status === "all"&&branch!=="all") {
    var result = await Parcel.aggregate([
      {
        $facet: {
          Booked: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $eq: LatestDayMonth,
                },
                $or: [{ status: "Booked" }, { status: "Sent" }],
                BookedFrom: branch,
              },
            },

            {
              $group: {
                _id: "null",
                // Product: { $sum: 1 },
                data: { $push: "$$ROOT" },
              },
            },
            {
              $project: {
                _id: 0,
                data: 1,
                // Product: 1
              },
            },
          ],
          send: [
            {
              $addFields: {
                updatedDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
                },
              },
            },
            {
              $match: {
                updatedDate: {
                  $eq: LatestDayMonth,
                },
                SendTo: branch,

                $or: [{ status: "Delivered" }, { status: "Recieved" }],
              },
            },

            {
              $group: {
                _id: "null",

                data: { $push: "$$ROOT" },
              },
            },
            {
              $project: {
                _id: 0,
                data: 1,
              },
            },
          ],
        },
      },
    ]);
    // return res.status(200).send(result)
    
    if (
      (result[0].Booked.length < 1 || result[0].Booked === undefined) &&
      (result[0].send.length < 1 || result[0].send === undefined)
    ) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      // return res.status(200).send(result)
      if (result[0].send.length < 1 || result[0].send === undefined) {
        result = result[0].Booked[0].data;
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
        // return res.status(200).send(result[0].BookedMonthly[0].data)
      } 
      else if (
        result[0].Booked.length < 1 ||
        result[0].Booked === undefined
      ) {
        result = result[0].send[0].data;
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      } else {
        result = result[0].Booked[0].data.concat(result[0].send[0].data);
        // console.log(result)
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      }
    }
  } 
  else if (status === "all"&&branch==="all") {
    console.log("Workinggggggggggggggggggggg");
    var result = await Parcel.aggregate([
      {
        $facet: {
          Booked: [
            {
              $addFields: {
                creationDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
                },
              },
            },
            {
              $match: {
                creationDate: {
                  $eq: LatestDayMonth,
                },
                $or: [{ status: "Booked" }, { status: "Sent" }],
                
              },
            },

            {
              $group: {
                _id: "null",
                // Product: { $sum: 1 },
                data: { $push: "$$ROOT" },
              },
            },
            {
              $project: {
                _id: 0,
                data: 1,
                // Product: 1
              },
            },
          ],
          send: [
            {
              $addFields: {
                updatedDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
                },
              },
            },
            {
              $match: {
                updatedDate: {
                  $eq: LatestDayMonth,
                },

                $or: [{ status: "Delivered" }, { status: "Recieved" }],
              },
            },

            {
              $group: {
                _id: "null",

                data: { $push: "$$ROOT" },
              },
            },
            {
              $project: {
                _id: 0,
                data: 1,
              },
            },
          ],
        },
      },
    ]);
    // return res.status(200).send(result)
    if (
      (result[0].Booked.length < 1 || result[0].Booked === undefined) &&
      (result[0].send.length < 1 || result[0].send === undefined)
    ) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      // return res.status(200).send(result)
      if (result[0].send.length < 1 || result[0].send === undefined) {
        result = result[0].Booked[0].data;
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
        // return res.status(200).send(result[0].BookedMonthly[0].data)
      } 
      else if (
        result[0].Booked.length < 1 ||
        result[0].Booked === undefined
      ) {
        result = result[0].send[0].data;
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      } else {
        result = result[0].Booked[0].data.concat(result[0].send[0].data);
        // console.log(result)
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }

        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      }
    }
  } 
  else if (status === "Booked"&&branch!=="all") {
    var result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $eq: LatestDayMonth,
          },
          status: status,
          BookedFrom: branch,
        },
      },
      {
        $group: {
          _id: "null",
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined)
      return res.status(400).json({ message: "there is no data to show" });
    var promises = await Promise.all(
      result[0].data.map(async (val, ind) => {
        parcel = await Parcel.findById({ _id: val._id }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return parcel;
      })
    );
    promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log(promises.length);
    const results = {};
    results.results = promises.slice(startIndex, endIndex);
    if (endIndex < promises.length) {
      results.next = {
        page: page + 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.next = {
        page: page,
        limit: limit,
        len: promises.length,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.prev = {
        page: 0,
        limit: limit,
        len: promises.length,
      };
    }
    return res.status(200).send(results);
    // return res.status(200).send(result[0].data)
  } 
  else if (status === "Sent"&&branch!=="all") {
    var result = await Parcel.aggregate([
      {
        $addFields: {
          updatedDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
        },
      },
      {
        $match: {
          updatedDate: {
            $eq: LatestDayMonth,
          },
          status: status,
          BookedFrom: branch,
        },
      },
      {
        $group: {
          _id: "null",
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined)
      return res.status(400).json({ message: "there is no data to show" });
    var promises = await Promise.all(
      result[0].data.map(async (val, ind) => {
        parcel = await Parcel.findById({ _id: val._id }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return parcel;
      })
    );
    promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log(promises.length);
    const results = {};
    results.results = promises.slice(startIndex, endIndex);
    if (endIndex < promises.length) {
      results.next = {
        page: page + 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.next = {
        page: page,
        limit: limit,
        len: promises.length,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.prev = {
        page: 0,
        limit: limit,
        len: promises.length,
      };
    }
    return res.status(200).send(results);
    // return res.status(200).send(result[0].data)
  } 
  else if ((status === "Recieved"&&branch!=="all") || (status === "Delivered"&&branch!=="all")) {
    var result = await Parcel.aggregate([
      {
        $addFields: {
          updatedDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
        },
      },
      {
        $match: {
          updatedDate: {
            $eq: LatestDayMonth,
          },
          status: status,
          SendTo: branch,
        },
      },
      {
        $group: {
          _id: "null",
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (result.length < 1 || result === undefined)
      return res.status(400).json({ message: "there is no data to show" });
    var promises = await Promise.all(
      result[0].data.map(async (val, ind) => {
        parcel = await Parcel.findById({ _id: val._id }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return parcel;
      })
    );
    promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log(promises.length);
    const results = {};
    results.results = promises.slice(startIndex, endIndex);
    if (endIndex < promises.length) {
      results.next = {
        page: page + 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.next = {
        page: page,
        limit: limit,
        len: promises.length,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
        limit: limit,
        len: promises.length,
      };
    } else {
      results.prev = {
        page: 0,
        limit: limit,
        len: promises.length,
      };
    }
    return res.status(200).send(results);
    // return res.status(200).send(result[0].data)
  }
  else if((status==="Recieved"||status==="Booked"||status==="Delivered"||status === "Sent")&&branch==="all"){
      var result = await Parcel.aggregate([
        {
          $addFields: {
            updatedDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            updatedDate: {
              $eq: LatestDayMonth,
            },
            status: status
          },
        },
        {
          $group: {
            _id: "null",
            data: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            data: 1,
          },
        },
      ]);
      if (result.length < 1 || result === undefined)
        return res.status(400).json({ message: "there is no data to show" });
      var promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
  
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }
  
      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      return res.status(200).send(results);
      // return res.status(200).send(result[0].data)
    } 
  else if(status ==="Expected" && branch!=="all") {
    var result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $eq: LatestDayMonth,
          },
          SendTo: branch,
          status: "Sent",
        },
      },

      {
        $group: {
          _id: "null",

          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (
      (result.length < 1 || result === undefined) &&
      (result.length < 1 || result === undefined)
    ) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      // return res.status(200).send(result)
      result = result[0].data;
      var promises = await Promise.all(
        result.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      return res.status(200).send(results);
      // res.status(200).send(promises)
    }
  }
  else{
    var result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $eq: LatestDayMonth,
          },
          status: "Sent",
        },
      },

      {
        $group: {
          _id: "null",

          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
        },
      },
    ]);
    if (
      (result.length < 1 || result === undefined) &&
      (result.length < 1 || result === undefined)
    ) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      // return res.status(200).send(result)
      result = result[0].data;
      var promises = await Promise.all(
        result.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      return res.status(200).send(results);
      // res.status(200).send(promises)
    }
  }
}

const firstData = async (req, res) => {
  const parcel = await Parcel.find().limit(1);
  const result = parcel[0].createdAt.toJSON().split("-")[0];
  console.log(result);
  res.status(200).send(result);
};

const parcelTrack = async (req, res) => {
  //const id = req.params.id;
  const id = req.query.id
  console.log(id);
  const parcel = await Parcel.findOne({ SearchId: id }).populate(
    "BookedFrom SendTo",
    "branch"
  );
  if (!parcel) return res.status(400).json({ message: "Invalid Parcel ID" });

  if (parcel.status === "Booked") {
    res.status(200).send({
      parcentage: "25",
      parcel: parcel,
    });
  } else if (parcel.status === "Sent") {
    res.status(200).send({
      parcentage: "50",
      parcel: parcel,
    });
  } else if (parcel.status === "Recieved") {
    res.status(200).send({
      parcentage: "75",
      parcel: parcel,
    });
  } else {
    res.status(200).send({
      parcentage: "100",
      parcel: parcel,
    });
  }
};

const departmentShowDelivered = async (req, res) => {
  const status = req.params.status;
  const calender = req.params.calender;
  const presentTime = new Date(calender);
  const branch = toId(req.params.branch);

  const presentMonth = presentTime.getMonth();

  const presentYear = presentTime.getFullYear();

  const presentDate = presentTime.getDate();

  if (presentMonth < 9 && presentDate < 10) {
    LatestDayMonth = `${presentYear}-0${presentMonth + 1}-0${presentDate}`;
  } else if (presentMonth < 9 && presentDate > 10) {
    LatestDayMonth = `${presentYear}-0${presentMonth + 1}-${presentDate}`;
  } else if (presentMonth >= 9 && presentDate > 10) {
    LatestDayMonth = `${presentYear}-${presentMonth + 1}-${presentDate}`;
    console.log(LatestDayMonth);
  } else {
    LatestDayMonth = `${presentYear}-${presentMonth + 1}-0${presentDate}`;
    console.log(LatestDayMonth);
  }
  if (status === "Delivered") {
    var result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $eq: LatestDayMonth,
          },
          status: status,
          SendTo: branch,
        },
      },
      {
        $group: {
          _id: "null",
          // Product: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          // Product: 1
        },
      },
    ]);

    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      const promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      return res.status(200).send(results);
    }
  } else {
    var result = await Parcel.aggregate([
      {
        $addFields: {
          creationDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          creationDate: {
            $eq: LatestDayMonth,
          },
          status: status,
          BookedFrom: branch,
        },
      },
      {
        $group: {
          _id: "null",
          // Product: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          // Product: 1
        },
      },
    ]);

    if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" });
    } else {
      const promises = await Promise.all(
        result[0].data.map(async (val, ind) => {
          parcel = await Parcel.findById({ _id: val._id }).populate(
            "BookedFrom SendTo",
            "branch"
          );
          return parcel;
        })
      );
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      console.log(promises.length);
      const results = {};
      results.results = promises.slice(startIndex, endIndex);
      if (endIndex < promises.length) {
        results.next = {
          page: page + 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.next = {
          page: page,
          limit: limit,
          len: promises.length,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
          len: promises.length,
        };
      } else {
        results.prev = {
          page: 0,
          limit: limit,
          len: promises.length,
        };
      }
      return res.status(200).send(results);
    }
  }
};

const subAdmingetParcel = async(req,res)=>{
  const calender = req.params.calender
  const presentTime = new Date(calender)
  let branch = req.params.branch
  console.log("sdafsdasdasdasd");
  if(branch!=="all"){
    branch = toId(req.params.branch)
  }
  else{
    branch  = "all"
  }
  const parcelId = req.params.parcelid
  const status = req.params.status
  console.log(branch, parcelId, status)

  const presentMonth = presentTime.getMonth()

  const presentYear = presentTime.getFullYear()

  const presentDate = presentTime.getDate()

  if (presentMonth < 9 && presentDate < 10) {
      LatestDayMonth = `${presentYear}-0${presentMonth + 1}-0${presentDate}`
  }
  else if (presentMonth < 9 && presentDate > 10) {
      LatestDayMonth = `${presentYear}-0${presentMonth + 1}-${presentDate}`
  }
  else if (presentMonth >= 9 && presentDate > 10) {
      LatestDayMonth = `${presentYear}-${presentMonth + 1}-${presentDate}`
  }
  else {
      LatestDayMonth = `${presentYear}-${presentMonth + 1}-0${presentDate}`
  }
  if(status==='all'&&branch!=="all"){
    
    var result = await Parcel.aggregate([
      {
          $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
      },
      {
          $match: {
              creationDate: {
                  $eq: LatestDayMonth
              },
              
              $or:[{BookedFrom: branch},{SendTo:branch}],
              SearchId:parcelId,
          }
      },

      {
          $group: {
              _id: 'null',
              // Product: { $sum: 1 },
              data: { $push: '$$ROOT' }
          }

      },
      {
          $project: {
              _id: 0,
              data: 1,
              // Product: 1
          }
      },
  ])
  console.log(result);
  if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" })
  }
  else  {
    console.log(result[0].data[0]);
    // return res.status(200).send(result[0].data[0])
    const parcel = await Parcel.findOne({ SearchId: result[0].data[0].SearchId }).populate(
      "BookedFrom SendTo",
      "branch"
    );
    return res.status(200).send(parcel)
  }
                  
  }
  else if(status==='all'&&branch==="all"){
    
    var result = await Parcel.aggregate([
      {
          $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
      },
      {
          $match: {
              creationDate: {
                  $eq: LatestDayMonth
              },
              
              // $or:[{BookedFrom: branch},{SendTo:branch}],
              SearchId:parcelId,
          }
      },

      {
          $group: {
              _id: 'null',
              // Product: { $sum: 1 },
              data: { $push: '$$ROOT' }
          }

      },
      {
          $project: {
              _id: 0,
              data: 1,
              // Product: 1
          }
      },
  ])
  console.log(result);
  if (result.length < 1 || result === undefined) {
      return res.status(400).json({ message: "There is no data to show" })
  }
  else  {
    console.log(result[0].data[0]);
    // return res.status(200).send(result[0].data[0])
    const parcel = await Parcel.findOne({ SearchId: result[0].data[0].SearchId }).populate(
      "BookedFrom SendTo",
      "branch"
    );
    return res.status(200).send(parcel)
  }
                  
  }
  else if ((status === 'Booked' || status === 'Sent')&&branch!=="all") {
      var result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
          },
          {
              $match: {
                  creationDate: {
                      $eq: LatestDayMonth
                  },
                  status:status,
                  BookedFrom: branch,
                  SearchId:parcelId
              }
          },

          {
              $group: {
                  _id: 'null',
                  // Product: { $sum: 1 },
                  data: { $push: '$$ROOT' }
              }

          },
          {
              $project: {
                  _id: 0,
                  data: 1,
                  // Product: 1
              }
          },
      ])
      if (result.length < 1 || result === undefined) {
          return res.status(400).json({ message: "There is no data to show" })
      }
      else  {
        console.log(result[0].data[0]);
        // return res.status(200).send(result[0].data[0])
        const parcel = await Parcel.findOne({ SearchId: result[0].data[0].SearchId }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return res.status(200).send(parcel)
      }
                      
  }
  else if ((status === 'Booked' || status === 'Sent')&&branch==="all") {
    var result = await Parcel.aggregate([
        {
            $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
        },
        {
            $match: {
                creationDate: {
                    $eq: LatestDayMonth
                },
                status:status,
                // BookedFrom: branch,
                SearchId:parcelId
            }
        },

        {
            $group: {
                _id: 'null',
                // Product: { $sum: 1 },
                data: { $push: '$$ROOT' }
            }

        },
        {
            $project: {
                _id: 0,
                data: 1,
                // Product: 1
            }
        },
    ])
    if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" })
    }
    else  {
      console.log(result[0].data[0]);
      // return res.status(200).send(result[0].data[0])
      const parcel = await Parcel.findOne({ SearchId: result[0].data[0].SearchId }).populate(
        "BookedFrom SendTo",
        "branch"
      );
      return res.status(200).send(parcel)
    }
                    
}
  else if((status === 'Recieved' || status === 'Delivered')&&branch!=="all"){
      var result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
          },
          {
              $match: {
                  creationDate: {
                      $eq: LatestDayMonth
                  },
                  status:status,
                  SendTo: branch,
                  SearchId:parcelId
              }
          },

          {
              $group: {
                  _id: 'null',
                  // Product: { $sum: 1 },
                  data: { $push: '$$ROOT' }
              }

          },
          {
              $project: {
                  _id: 0,
                  data: 1,
          
              }
          },
      ])
      if (result.length < 1 || result === undefined) {
          return res.status(400).json({ message: "There is no data to show" })
      }
      else  {
        console.log(result[0].data[0]);
        // return res.status(200).send(result[0].data[0])
        const parcel = await Parcel.findOne({ SearchId: result[0].data[0].SearchId }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return res.status(200).send(parcel)
      }

  }
  else if((status === 'Recieved' || status === 'Delivered')&&branch==="all"){
    var result = await Parcel.aggregate([
        {
            $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } }
        },
        {
            $match: {
                creationDate: {
                    $eq: LatestDayMonth
                },
                status:status,
                // SendTo: branch,
                SearchId:parcelId
            }
        },

        {
            $group: {
                _id: 'null',
                // Product: { $sum: 1 },
                data: { $push: '$$ROOT' }
            }

        },
        {
            $project: {
                _id: 0,
                data: 1,
        
            }
        },
    ])
    if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" })
    }
    else  {
      console.log(result[0].data[0]);
      // return res.status(200).send(result[0].data[0])
      const parcel = await Parcel.findOne({ SearchId: result[0].data[0].SearchId }).populate(
        "BookedFrom SendTo",
        "branch"
      );
      return res.status(200).send(parcel)
    }

}
  else if((status === 'Expected' )&&branch!=="all"){
      var result = await Parcel.aggregate([
          {
              $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" } } }
          },
          {
              $match: {
                  creationDate: {
                      $eq: LatestDayMonth
                  },
                  status:'Sent',
                  SendTo: branch,
                  SearchId:parcelId
              }
          },

          {
              $group: {
                  _id: 'null',
                  // Product: { $sum: 1 },
                  data: { $push: '$$ROOT' }
              }

          },
          {
              $project: {
                  _id: 0,
                  data: 1,
          
              }
          },
      ])
      if (result.length < 1 || result === undefined) {
          return res.status(400).json({ message: "There is no data to show" })
      }
      else  {
        console.log(result[0].data[0]);
        // return res.status(200).send(result[0].data[0])
        const parcel = await Parcel.findOne({ SearchId: result[0].data[0].SearchId }).populate(
          "BookedFrom SendTo",
          "branch"
        );
        return res.status(200).send(parcel)
      }

  }
  else {
    var result = await Parcel.aggregate([
        {
            $addFields: { creationDate: { $dateToString: { format: "%Y-%m-%d", date: "$expectedDate" } } }
        },
        {
            $match: {
                creationDate: {
                    $eq: LatestDayMonth
                },
                status:'Sent',
                // SendTo: branch,
                SearchId:parcelId
            }
        },

        {
            $group: {
                _id: 'null',
                // Product: { $sum: 1 },
                data: { $push: '$$ROOT' }
            }

        },
        {
            $project: {
                _id: 0,
                data: 1,
        
            }
        },
    ])
    if (result.length < 1 || result === undefined) {
        return res.status(400).json({ message: "There is no data to show" })
    }
    else  {
      console.log(result[0].data[0]);
      // return res.status(200).send(result[0].data[0])
      const parcel = await Parcel.findOne({ SearchId: result[0].data[0].SearchId }).populate(
        "BookedFrom SendTo",
        "branch"
      );
      return res.status(200).send(parcel)
    }

}
  
}


const ArchivedParcel = async(req,res)=>{
  const search = req.query.parcelId
  console.log(search);
  const calender = req.params.calender;
  const presentTime = new Date(calender);
  let branch = req.params.branch
  if(branch !== 'all'){
     branch = toId(req.params.branch);
  }
  else{
    branch = req.params.branch
  }
  
  let presentMonth = presentTime.getMonth();

  let presentYear = presentTime.getFullYear();

  let presentDate = presentTime.getDate();

  presentMonth = presentMonth+1
  if(presentMonth<10){
    presentMonth = `0${presentMonth}`
  }
  if(presentDate<10){
    presentDate = `0${presentDate}`
  }
  let LastDayMonth = `${presentYear}-${presentMonth}-${presentDate}`;
  console.log(LastDayMonth);
  if(search==="null"){
    if (branch!=="all") {
      const result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            creationDate: {
              $eq: LastDayMonth
            },
            BookedFrom: branch,
            $or:[{status:"Recieved"},{status:"Delivered"}]
          },
        },
      ]);
      if(result.length<1||result===undefined){
        return res.status(400).json({message:"There is no data to show"})
      }
      else {
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      } 
      // return res.status(200).send(result)
    }
    else{
      const result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            creationDate: {
              $eq: LastDayMonth
            },
            $or:[{status:"Recieved"},{status:"Delivered"}]
          },
        },
      ]);
      if(result.length<1||result===undefined){
        return res.status(400).json({message:"There is no data to show"})
      }
      else {
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      } 
      // return res.status(200).send(result)
    }
  }
  else{
    if (branch!=="all") {
      const result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            creationDate: {
              $eq: LastDayMonth
            },
            BookedFrom: branch,
            $or:[{status:"Recieved"},{status:"Delivered"}],
            SearchId:search
          },
        },
      ]);
      if(result.length<1||result===undefined){
        return res.status(400).json({message:"There is no data to show"})
      }
      else {
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      } 
      // return res.status(200).send(result)
    }
    else{
      const result = await Parcel.aggregate([
        {
          $addFields: {
            creationDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            creationDate: {
              $eq: LastDayMonth
            },
            $or:[{status:"Recieved"},{status:"Delivered"}],
            SearchId:search
          },
        },
      ]);
      if(result.length<1||result===undefined){
        return res.status(400).json({message:"There is no data to show"})
      }
      else {
        var promises = await Promise.all(
          result.map(async (val, ind) => {
            parcel = await Parcel.findById({ _id: val._id }).populate(
              "BookedFrom SendTo",
              "branch"
            );
            return parcel;
          })
        );
        promises = promises.sort((a,b)=>new Date(b.updatedAt) - new Date(a.updatedAt))
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
  
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        console.log(promises.length);
        const results = {};
        results.results = promises.slice(startIndex, endIndex);
        if (endIndex < promises.length) {
          results.next = {
            page: page + 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.next = {
            page: page,
            limit: limit,
            len: promises.length,
          };
        }
  
        if (startIndex > 0) {
          results.prev = {
            page: page - 1,
            limit: limit,
            len: promises.length,
          };
        } else {
          results.prev = {
            page: 0,
            limit: limit,
            len: promises.length,
          };
        }
        return res.status(200).send(results);
      } 
      // return res.status(200).send(result)
    }
  }
 
}

router.route("/parcelApi/parcel/:send/:to/:employee").post(newParcel);
// optional Route
router
  .route("/parcelApi/see/:parcelid/:phn/:branch/:status")
  .get(getParcel);
//
router
  .route("/parcelApi/forSearch/subAdmin/:parcelid/:calender/:branch/:status")
  .get(subAdmingetParcel);
router.route("/parcelApi/see/oneProduct/:parcelUniqueid").get(getUniqueParcel);
router.route("/parcelApi/seeComingProduct/:id").get(comingProduct);
router.route("/parcelApi/see/getAll/allParcel").get(allParcel);
router.route("/parcelApi/updateParcel/:id").put(updateParcel);
router.route("/parcelApi/recreateParcel/newUpdate/:id").put(newUpdateParcel);
router.route("/parcelApi/deleteParcel/:id").delete(deleteParcel);
router.route("/parcelApi/deleteParcel/sorted").get(sortedData);
router.route("/parcelApi/deleteParcel/getData/:time").get(getData);
router
  .route("/parcelApi/branchUser/bookedFrom/:branchId/:status/:time/:sortingBranch")
  .get(BookedBranchData);
router
  .route("/parcelApi/branchUser/sendTo/:phn/:branchId/:status/:time/:sortingBranch")
  .get(SentBranchData);
router.route("/parcelApi/branchUser/:userId/:date").get(SelfData);
router.route("/parcelApi/generateId").get(generateProductId);
router
  .route("/parcelApi/subAdmin/dashboard/:calender/:date/")
  .get(subAdminDash);
router
  .route("/parcelApi/subAdmin/dashboard/card/totalshow/:branch")
  .get(subAdminDashCard);
router
  .route("/parcelApi/subAdmin/bookedFrom/history/:calender/:branch")
  .get(subAdminHistory);
router
  .route("/parcelApi/subAdmin/sendTo/history/:calender/:branch")
  .get(subAdminHistorySend);
router
  .route("/parcelApi/admin/dashboard/allBranch/:calender/:date/:department")
  .get(AdminDashAll);
router
  .route("/parcelApi/admin/dashboard/:calender/:date/:branchId")
  .get(AdminDash);
router
  .route("/parcelApi/admin/dashboard/sendTo/all/:calender/:date/:branchId")
  .get(AdminDashSend);
router
  .route("/parcelApi/admin/dashboard/cardAll/totalshow/:calender/:date")
  .get(AdminDashCardAll);

router
  .route("/parcelApi/admin/dashboard/cardBranch/new/:branch/:calender/:date")
  .get(AdminDashCardBranch);
router
  .route("/parcelApi/admin/dashboard/sendTo/totalShowbranch/cardBranch/:branch")
  .get(AdminDashCardBranchSend);
router.route("/testApi/testData/:calender/:date/:branch").get(Test);
router
  .route("/parcelApi/bookedSend/all/:branch/:calender/:status")
  .get(SubAdminBookedSend);
router.route("/textApi/userMessage").post(sendText);
router.route("/firstData/year").get(firstData);
router.route("/parcelTrack").get(parcelTrack);
router
  .route("/parcelapi/Departmentpart/showIndividual/:branch/:calender/:status")
  .get(departmentShowDelivered);
router
  .route("/parcelApi/admin/dashboard/:calender/:date/:branchId/:department")
  .get(TestAdminDash);
router.route('/sendOTP/:id')
  .post(sendOTP)
// router.route('/Count')
//   .get(getCount)
router.route('/Count/postCount/number/:id')
  .put(updateCount)

router.route('/archivedParcel/:calender/:branch')
  .get(ArchivedParcel)

module.exports = router;




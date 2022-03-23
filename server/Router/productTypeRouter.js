const express = require('express');
const app = express()
app.use(express.json())
const router = express.Router();
const {productType} = require('../models/productTypeModel')
const SaveType = async(req,res)=>{
    const type = new productType(req.body)
    await type.save() 
    return res.status(200).send(type)
}
const getType = async(req,res)=>{
    const result =await productType.distinct('productType')
    return res.status(200).send(result)
}
router.route('/typeApi/saveProductType')
    .post(SaveType)
router.route('/getType')
    .get(getType)
module.exports = router;
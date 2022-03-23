const { Schema, model } = require('mongoose');
const productTypeSchema = new Schema({  
    productType: {
        type: String,
        required: true
    }
})


const productType = model('type', productTypeSchema);
module.exports.productType = productType;
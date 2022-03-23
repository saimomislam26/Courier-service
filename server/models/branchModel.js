const { Schema, model } = require('mongoose');
const branchSchema = new Schema({  
    branch: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        minlength: 11,
        required: true
    }
})


const Branch = model('branch', branchSchema);
module.exports.Branch = Branch;

const { Schema, model } = require('mongoose');
const countSchema = new Schema({  
    count: {
        type: Number
    },
},
{
    timestamps:true
})


const Count = model('count', countSchema);
module.exports.Count = Count;
const { Schema, model } = require('mongoose');
const historySchema = new Schema({  
    user: {
        type: String
    },
    message:{
        type: String
    },
    branch:{type:Schema.Types.ObjectId,ref:'branch'},
    tag:{
        type: String
    }
},
{
    timestamps:true
})


const History = model('history', historySchema);
module.exports.History = History;
const { Schema, model } = require('mongoose');
const joi = require('joi');
const parcelSchema = new Schema({
    ProductType:String,
    SenderName: String,
    SearchId:String,
    SenderNumber: Number,
    SenderEmail: String,
    RecieverName:String,
    RecieverNumber: Number,
    RecieverEmail:String,
    BookedFrom:{type:Schema.Types.ObjectId,ref:'branch'},
    SendTo:{type:Schema.Types.ObjectId,ref:'branch'},
    TotalCost:Number,
    PaidAmount:Number,
    PayableAmount:Number,
    status:String,
    onCondition:Number,
    Fee:Number,
    expectedDate:{
        type:Date
    },
    BookedBy:{type:Schema.Types.ObjectId,ref:'user'},
    OTP:String,
    referance:{
        default:null,
        type:String},

    // date: { type: Date, default: Date}
},
{
    timestamps:true
})

// const validateUser = (parcel) => {
//     const schema = joi.object({
//         ProductType:joi.string().required(),
//         SenderName:joi.string().required(),
//         SenderNumber:joi.number().integer().required(),
//         SenderEmail:joi.string().email().min(5).max(100).required(),
//         RecieverName:joi.string().required(),
//         RecieverNumber:joi.number().integer().required(),
//         RecieverEmail:joi.string().email().min(5).max(100).required(),
//         TotalCost:joi.number().required(),
//         PaidAmount:joi.number().required(),
//         PayableAmount:joi.number.required(),
//         status:joi.string().required()
//         // Username:joi.string().required(),
//         // Email: joi.string().email().min(5).max(100).required(),
//         // Password: passwordComplexity(complexityOptions),
//         // Cpassword:passwordComplexity(complexityOptions),
//         // IsAdmin:joi.boolean(),
//         // IsSuperAdmin:joi.boolean()

//     })
//     return schema.validate(parcel);
// }


const Parcel = model('parcel', parcelSchema);
module.exports.Parcel = Parcel;
// module.exports.validate = validateUser;
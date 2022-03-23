const { Schema, model } = require('mongoose');
const joi = require('joi');
const passwordComplexity = require("joi-password-complexity");
const jwt = require('jsonwebtoken')
const userSchema = new Schema({
    Username: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Cpassword: {
        type: String
    },
    Email:{
        type:String,
        required:true
    },
    IsAdmin:{
        type:Boolean,
        default:false
    },
    IsSuperAdmin:{
        type:Boolean,
        default:false
    },
    Section:{
        type:String
    },
    branch:{type:Schema.Types.ObjectId,ref:'branch'},
    contact: {
        type: Number,
        minlength: 11 
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }

    ]
   
})

const complexityOptions = {
    min: 6,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
};



userSchema.methods.generateJWT = function () {
    const token = jwt.sign({
        _id: this._id,
        Username: this.Username,
        Email: this.Email,
        IsAdmin: this.IsAdmin,
        IsSuperAdmin: this.IsSuperAdmin,
        branch:this.branch,
    }, process.env.SECRET_KEY)
    this.tokens = this.tokens.concat({ token: token });

    return token;
}
const validateUser = (user) => {
    const schema = joi.object({
        Username:joi.string().required(),
        Email: joi.string().required(),
        // .email().min(5).max(100).required(),
        Password: passwordComplexity(complexityOptions),
        Cpassword:passwordComplexity(complexityOptions),
        IsAdmin:joi.boolean(),
        IsSuperAdmin:joi.boolean(),
        contact:joi.number(),
        Section:joi.string()
    })
    return schema.validate(user);
}



const User = model('user', userSchema);
module.exports.User = User;
module.exports.validate = validateUser;
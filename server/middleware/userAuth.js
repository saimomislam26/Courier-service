const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const authenticate = async (req, res, next) => {
    const token = req.cookies.jwtoken;
    if (!token) return res.status(403).json({message:"No Token"})
    try {
       
        //all user info from database will be saved of this verified token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const rootUser = await User.findOne({ _id: decoded._id, "tokens.token": token }).populate("branch","branch")
        if (!rootUser) return res.status(400).json({message:"User Not Found"})
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id
        next();
    } catch (err) {
        res.status(401).send("unathorized!No token Provided")
    }
}
module.exports = authenticate;
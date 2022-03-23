const express = require('express');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const app = express();
const { User, validate } = require('../models/userModel')
const { Branch } = require('../models/branchModel')
const auth = require('../middleware/userAuth')
const bcrypt = require('bcrypt');
const _ = require('lodash');
const router = express.Router();
const toId = mongoose.Types.ObjectId

app.use(cookieParser())

const newUser = async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { Email, Password, Cpassword, Username, contact,Section } = req.body
    if (!Email || !Password || !Cpassword || !Username || !contact ||!Section) return res.status(400).json({ message: "Fill All the Fields" })

    let user = await User.findOne({ Username:Username });
    if (user) return res.status(400).json({ message: 'The Name Is Already Taken' });
    user = new User(req.body);
    // _.pick(req.body, ['Email', 'Password'])

    const salt = await bcrypt.genSalt(10);
    if (Password !== Cpassword) return res.status(400).json({ message: "Password Doesn't Match" })
    user.Password = await bcrypt.hash(Password, salt);
    user.Cpassword = await bcrypt.hash(Cpassword, salt);
    // console.log(pass)
    // if (!pass) return res.status(400).json({message:"Password Doesn't Match"})

    user.branch = req.params.branch

    user = await user.save()

    const branch = await Branch.findById({ _id: user.branch })
    if (!branch) return res.status(400).json({ message: "Branch Does not exist" })
    const result = await User.findById(user._id).populate("branch", "branch contact")
    await result.save()
    return res.status(200).send({
        user: _.pick(result, ['_id', 'Email', 'IsAdmin', 'IsSuperAdmin', 'branch','Section']),
    });

}

const allUser = async (req, res) => {
    const user = await User.find()
    if (!user) return res.status(400).json({ message: "No User Found" })
    const result = await User.find({$and:[{IsAdmin:false},{IsSuperAdmin:false}]}).populate("branch", "branch contact")
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    console.log(result.length)
    const results = {}
    results.results = result.slice(startIndex, endIndex)
    if (endIndex < result.length) {
        results.next = {
            page: page + 1,
            limit: limit,
            len: result.length
        }
    }
    else {
        results.next = {
            page: page,
            limit: limit,
            len: result.length

        }
    }

    if (startIndex > 0) {
        results.prev = {
            page: page - 1,
            limit: limit,
            len: result.length
        }
    }
    else {
        results.prev = {
            page: 0,
            limit: limit,
            len: result.length
        }
    }

    return res.status(200).send(results)

}
const getUser = async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById({ _id: id })
        if (!user) return res.status(400).json({ message: "Id Not Found" })
        const result = await User.findById(user._id).populate("branch", "branch contact")
        await result.save()
        return res.status(200).send(result)
    } catch (err) {
        return res.status(400).send("ID Not Found")
    }

}

const updateUser = async (req, res) => {
    const id = req.params.id
    console.log(id)
    const updatedData = req.body
    console.log(updatedData.Password);
    console.log(typeof(updatedData.Cpassword));
    console.log();
    try {
         if((updatedData.Password===undefined&&updatedData.Cpassword===undefined)||(updatedData.Password===""&&updatedData.Cpassword==="")){
             if(updatedData.Username===""){
                return res.status(400).json({ message: "Name Field Can not be empty" })
             }
             else{
                const user = await User.findByIdAndUpdate(id, updatedData, { new: true })
                if (!user) return res.status(400).json({ message: "Id Not Found" })
                return res.status(200).send(user)
             }
           
         }
         else if(updatedData.Password&&updatedData.Cpassword){
            const salt = await bcrypt.genSalt(10);
            if (updatedData.Password !== updatedData.Cpassword) return res.status(400).json({ message: "Password Doesn't Match" })
            updatedData.Password = await bcrypt.hash(updatedData.Password, salt);
            updatedData.Cpassword = await bcrypt.hash(updatedData.Cpassword, salt);
            if(updatedData.Username===""){
                return res.status(400).json({ message: "Name Field Can not be empty" })
             }
             else{
                const user = await User.findByIdAndUpdate(id, updatedData, { new: true })
                if (!user) return res.status(400).json({ message: "Id Not Found" })
                return res.status(200).send(user)
             }
         }
         else if((updatedData.Password&&updatedData.Cpassword===undefined)||(updatedData.Password===undefined&&updatedData.Cpassword)){
            return res.status(400).json({message:"field must be filled"})
         }
         else{
             return res.status(400).json({message:"Testing"})
         }
        
    } catch (err) {
        return res.status(400).json({ message: "Something Went Wrong" })
    }

}


const deleteUser = async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findByIdAndDelete(id)
        if (!user) return res.status(400).json({ message: "Id Not Found" })
        return res.status(200).send(user)
    } catch (err) {
        return res.status(400).send("ID Not Found")
    }

}


const login = async (req, res) => {

    const { Username, password } = req.body
    if (!Username || !password) return res.status(400).json({ message: "fill the empty field" });
    const user = await User.findOne({ Username: req.body.Username }).populate("branch", "branch contact")
    if (!user) return res.status(400).json({ message: "This User is not registered" })
    const pass = await bcrypt.compare(req.body.password, user.Password);
    if (!pass) return res.status(400).json({ message: "incorrect Password" })

    const token = user.generateJWT();

    res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 25892000000),
        // httpOnly: true
    });
    const result = await user.save();

    res.status(200).send({
        token: token,
        user: _.pick(result, ['_id', 'Username', 'Email', 'IsAdmin', 'IsSuperAdmin', 'branch', 'Section'])
    })

}

const getAuthenticateInfo = async (req, res) => {
    return res.status(200).send(req.rootUser)
}

const getUserBranch = async (req, res) => {
    const branchId = toId(req.params.branchId)
    console.log(branchId)
    const user = await User.find({ branch: branchId,$and:[{IsAdmin:false},{IsSuperAdmin:false}] }).populate("branch", "branch contact")
    if (!user) return res.status(400).json({ message: "No User Found" })
    // const result = await User.find()
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    console.log(user.length)
    const results = {}
    results.results = user.slice(startIndex, endIndex)
    if (endIndex < user.length) {
        results.next = {
            page: page + 1,
            limit: limit,
            len: user.length
        }
    }
    else {
        results.next = {
            page: page,
            limit: limit,
            len: user.length

        }
    }

    if (startIndex > 0) {
        results.prev = {
            page: page - 1,
            limit: limit,
            len: user.length
        }
    }
    else {
        results.prev = {
            page: 0,
            limit: limit,
            len: user.length
        }
    }

    return res.status(200).send(results)

}

const test = async (req, res) => {
    const result = await User.aggregate([

        {
            $match: {
                IsAdmin: false
            }
        },

        {
            $group: {
                _id: '$Username',
                total: { $sum: 1 }
            }

        },
        {
            $addFields: {
                Total: '$total'
            }
        },
        {
            $match: {
                $lt: '$Total'
            }
        }

    ]
    )



    res.status(200).send(result)

}

const getSubAdmin = async (req, res) => {
    var param = req.params.branchId
    console.log(param)
    if(param==='all'){
        const user = await User.find({ IsAdmin: true }).populate('branch','branch')
        if (!user) return res.status(400).json({ message: "There is no SubAdmin" })
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    console.log(user.length)
    const results = {}
    results.results = user.slice(startIndex, endIndex)
    if (endIndex < user.length) {
        results.next = {
            page: page + 1,
            limit: limit,
            len: user.length
        }
    }
    else {
        results.next = {
            page: page,
            limit: limit,
            len: user.length

        }
    }

    if (startIndex > 0) {
        results.prev = {
            page: page - 1,
            limit: limit,
            len: user.length
        }
    }
    else {
        results.prev = {
            page: 0,
            limit: limit,
            len: user.length
        }
    }

    return res.status(200).send(results)
        // return res.status(200).send(user)
    }else{
        param = toId(param)
        console.log(param)
        const user = await User.find({ $and:[{IsAdmin: true},{branch:param}]}).populate('branch','branch')
        if (!user) return res.status(400).json({ message: "There is no SubAdmin" })
        const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    console.log(user.length)
    const results = {}
    results.results = user.slice(startIndex, endIndex)
    if (endIndex < user.length) {
        results.next = {
            page: page + 1,
            limit: limit,
            len: user.length
        }
    }
    else {
        results.next = {
            page: page,
            limit: limit,
            len: user.length

        }
    }

    if (startIndex > 0) {
        results.prev = {
            page: page - 1,
            limit: limit,
            len: user.length
        }
    }
    else {
        results.prev = {
            page: 0,
            limit: limit,
            len: user.length
        }
    }

    return res.status(200).send(results)
    }

}


const findUser = async (req, res) => {
    const { userName } = req.body
    if (!userName) return res.status(400).json({ message: "Give a Username" })
    console.log(userName)

    const branchId = req.params.branch
    console.log(branchId)
    if (branchId !== 'all') {
        const result = await User.find({ $and: [{ Username: new RegExp('^' + userName, 'i') }, { branch: toId(branchId) },{ IsAdmin: false, IsSuperAdmin: false }] }).populate('branch', 'branch')

        if (result.length === 0 || result === undefined) return res.status(400).json({ message: 'There Is No Data To Show' })

        else {
            const page = parseInt(req.query.page)
            const limit = parseInt(req.query.limit)

            const startIndex = (page - 1) * limit
            const endIndex = page * limit
            console.log(result.length)
            const results = {}
            results.results = result.slice(startIndex, endIndex)
            if (endIndex < result.length) {
                results.next = {
                    page: page + 1,
                    limit: limit,
                    len: result.length
                }
            }
            else {
                results.next = {
                    page: page,
                    limit: limit,
                    len: result.length

                }
            }

            if (startIndex > 0) {
                results.prev = {
                    page: page - 1,
                    limit: limit,
                    len: result.length
                }
            }
            else {
                results.prev = {
                    page: 0,
                    limit: limit,
                    len: result.length
                }
            }
            return res.status(200).send(results)
        }
    }
    else {
        const value = req.query.value
        console.log(value)
        if (value === 'SubAdmin') {
            const result = await User.find({ $and: [{ Username: new RegExp('^' + userName, 'i') }, { IsAdmin: true }] }).populate('branch', 'branch')

            if (result.length === 0 || result === undefined) return res.status(400).json({ message: 'There Is No Data To Show' })

            else {
                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)

                const startIndex = (page - 1) * limit
                const endIndex = page * limit
                console.log(result.length)
                const results = {}
                results.results = result.slice(startIndex, endIndex)
                if (endIndex < result.length) {
                    results.next = {
                        page: page + 1,
                        limit: limit,
                        len: result.length
                    }
                }
                else {
                    results.next = {
                        page: page,
                        limit: limit,
                        len: result.length

                    }
                }

                if (startIndex > 0) {
                    results.prev = {
                        page: page - 1,
                        limit: limit,
                        len: result.length
                    }
                }
                else {
                    results.prev = {
                        page: 0,
                        limit: limit,
                        len: result.length
                    }
                }
                return res.status(200).send(results)
            }
        }
        else {
            const result = await User.find({ $and: [{ Username: new RegExp('^' + userName, 'i') }, { IsAdmin: false, IsSuperAdmin: false }] }).populate('branch', 'branch')

            if (result.length === 0 || result === undefined) return res.status(400).json({ message: 'There Is No Data To Show' })

            else {
                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)

                const startIndex = (page - 1) * limit
                const endIndex = page * limit
                console.log(result.length)
                const results = {}
                results.results = result.slice(startIndex, endIndex)
                if (endIndex < result.length) {
                    results.next = {
                        page: page + 1,
                        limit: limit,
                        len: result.length
                    }
                }
                else {
                    results.next = {
                        page: page,
                        limit: limit,
                        len: result.length

                    }
                }

                if (startIndex > 0) {
                    results.prev = {
                        page: page - 1,
                        limit: limit,
                        len: result.length
                    }
                }
                else {
                    results.prev = {
                        page: 0,
                        limit: limit,
                        len: result.length
                    }
                }
                return res.status(200).send(results)
            }
        }
    }
}

router.route('/userApi/user/:branch')
    .post(newUser)
router.route('/userApi/user/getUser')
    .get(allUser)
router.route('/userApi/user/:id')
    .get(getUser)
router.route('/userApi/user/getUserbranch/:branchId')
    .get(getUserBranch)
router.route('/userApi/user/update/:id')
    .put(updateUser)
router.route('/userApi/user/delete/:id')
    .delete(deleteUser)
router.route('/userApi/login')
    .post(login)
router.route('/authentication')
    .get(auth, getAuthenticateInfo)
router.route('/userApi/Admin/getSubadmin/:branchId')
    .get(getSubAdmin)
router.route('/userApi/test')
    .get(test)
router.route('/userApi/userSearch/:branch')
    .post(findUser)

module.exports = router;


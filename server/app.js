const express = require('express');
const cookieParser = require('cookie-parser')
const userRouter = require('./Router/userRouter');
const branchRouter = require('./Router/branchRouter');
const parcelRouter = require('./Router/parcelRouter')
const historyRouter = require('./Router/historyRouter')
const productTypeRouter = require('./Router/productTypeRouter')
const cors = require("cors");
const app = express();
app.use(cookieParser());
app.use(express.json());



// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    // http://10.11.70.9:3000
    res.setHeader('Access-Control-Allow-Origin', 'http://10.11.70.9:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(userRouter, cors())
app.use(parcelRouter,cors())
app.use(branchRouter,cors())
app.use(historyRouter,cors())
app.use(productTypeRouter,cors())
module.exports = app;


//saimomislam@gmail.com
//Saimom@1


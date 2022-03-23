const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');

const mongoose = require('mongoose');
// console.log(process.env.DB_USER);
mongoose.connect(process.env.DB_USER,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connect To MongoDB"))
    .catch((err) => console.log(err))

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening port ${port}...`)
})
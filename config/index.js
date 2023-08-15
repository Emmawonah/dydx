const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = () => {
    mongoose.set('strictQuery', false)
    mongoose.connect(process.env.MONGO_URI)
    .then(console.log("Connected to database successfully!"))
    .catch( err => console.log(err))
}

module.exports = { connectDB }
const mongoose = require("mongoose");


const connectDB = async () => {
    await mongoose.connect("mongodb+srv://Shubham_1210:devTinder2026@devtinder.rf5e6f0.mongodb.net/devTinder")
}

module.exports = connectDB;
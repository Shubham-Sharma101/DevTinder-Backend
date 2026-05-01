const express = require('express');
const connectDB = require("./config/database")
const app = express();
const User = require("./models/user")

app.post("/signup", async (req, res) => {
    // Creating a new instance of the User model
    const user = new User({
        firstName: "Virat",
        lastName: "Kohli",
        emailId: "Virat@Kohli.com",
        password: "Virat@123"
    })
    try {
        await user.save()
        res.send("User Added Successfully!")
    } catch (err) {
        res.status(400).ssend("Error saving the user : " + err.message)

    }

})

connectDB().then(() => {
    console.log("Database connection established.");
    app.listen(3000, () => {
        console.log("Server is successfully listening on port 3000...")
    });

}).catch((err) => {
    console.log("Database cannot be connected!!");

})

const express = require('express');
const connectDB = require("./config/database")
const app = express();
const User = require("./models/user")

app.use(express.json())

app.post("/signup", async (req, res) => {
    console.log(req.body);

    // Creating a new instance of the User model
    const user = new User(req.body)
    try {
        await user.save()
        res.send("User Added Successfully!")
    } catch (err) {
        res.status(400).send("Error saving the user : " + err.message)

    }

})

// Get User by email
app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId
    try {
        const user = await User.findOne({ emailId: userEmail })
        if (user.length === 0) {
            res.status(404).send("User Not Found");
        } else {
            res.send(user)
        }
    } catch (err) {
        res.status(400).send("something went wrong...")
    }
})


// Feed API - GET /Feed - get all the users from the database
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (err) {
        res.status(400).send("Something went wrong...")
    }

})

// Delete a User from database
app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete({ _id: userId })
        // const user = await User.findByIdAndDelete(userId)
        res.send("User deleted Successfully")
    } catch (err) {
        res.status(400).send("Something went wrong...")
    }
})

// update the user data
app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;

    try {
        const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age"]
        const isUpdateAllowed = Object.keys(data).every(k => ALLOWED_UPDATES.includes(k))
        if (!isUpdateAllowed) {
            throw new Error("Update not allowed")
        }
        if (data.skills.length > 10) {
            throw new Error("Skills can not be more than 10")
        }
        const user = await User.findByIdAndUpdate({ _id: userId }, data, {
            returnDocument: 'after',
            runValidators: true
        })
        res.send("User Updated Successfully::::")
        console.log(user);

    } catch (err) {
        res.status(400).send("Update Failed:" + err.message)
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

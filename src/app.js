const express = require('express');
const connectDB = require("./config/database")
const app = express();
const User = require("./models/user")
const { validateSignUpData } = require("./utils/validation")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const {userAuth} = require("./middlewares/auth")
app.use(express.json())
app.use(cookieParser())

app.post("/signup", async (req, res) => {
    try {
        // validation of data
        validateSignUpData(req)
        // Encrypt the password
        const { firstName, lastName, emailId, password } = req.body
        const passwordHash = await bcrypt.hash(password, 10)
        console.log(passwordHash);

        // Creating a new instance of the User Model
        console.log(req.body);

        // Creating a new instance of the User model
        const user = new User({
            firstName, lastName, emailId, password: passwordHash,
        })

        await user.save()
        res.send("User Added Successfully!")
    } catch (err) {
        res.status(400).send("Error : " + err.message)

    }

})


app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body
        const user = await User.findOne({ emailId: emailId })
        if (!user) {
            throw new Error("Invalid Credentials...")
        }
        const isPasswordValid = await user.validatePassword(password)
        if (isPasswordValid) {
            // Create a JWT Token
            const token = await user.getJWT()
            //  Add the token to cookie and send the response back to the user
            res.cookie("token", token, {expires : new Date(Date.now() + 8 * 360000)})
            res.send("Login Successfull!!")
        } else {
            throw new Error("Invalid Credentials...")
        }
    } catch (err) {
        res.status(400).send("Update Failed:" + err.message)
    }
})

app.get("/profile",userAuth ,async (req, res) => {
    try {
        const user = req.user
        res.send(user)
    } catch (err) {
        res.status(400).send("Error :" + err.message)
    }

})


app.post("/sendConnectionRequest", userAuth, async (req, res) =>{
    const user = req.user
    res.send(user.firstName + " Sent the connection request")
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

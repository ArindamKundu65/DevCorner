import express from "express";
import connectDB from "./config/database.js"
import User from "./models/user.js";
import { validateSignUpData } from "./utils/validation.js"
import bcrypt from "bcrypt"


const app = express();
const port = 3000;

app.use(express.json());

app.post("/signup", async (req, res) => {

    try {
        //Validation of data
        validateSignUpData(req);

        const { firstName, lastName, emailId, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash);


        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash
        })



        await user.save();
        console.log(user)
        res.send("User Added successfully");
    } catch (error) {
        res.status(404).send(`Error: ${error.message}`);

    }
})


app.post("/login",async (req, res)=>{
    try {
        const {emailId, password} = req.body;

        const user = await User.findOne({emailId});
        if (!user) {
            throw new Error("invalid credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            res.send("Login succesfull");
        } else {
            throw new Error("invalid credentials")
        }
    } catch (error) {
        res.status(400).send("ERROR: "+ error.message)
    }
})




app.get("/users", async (req, res) => {
    const emailId = req.body.emailId;

    try {
        const users = await User.find({ emailId });
        if (users.length === 0) {
            res.send("users not found")
        }
        else {
            res.send(users)
        }
    } catch (err) {
        res.send(err.message)
    }
})

app.get("/feed", async (req, res) => {

    try {
        const users = await User.find();
        res.send(users)

    } catch (err) {
        res.send(err.message)
    }

})

app.get("/getOne", async (req, res) => {
    const id = req.body.id

    const user = await User.findById(id);
    res.send(user)
})

// Update API
app.patch("/update/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;
    try {

        const allowedUpdates =
            ["photoUrl", "about", "gender", "age", "skills"];

        const isUpdateAllowed = Object.keys(data).every((k) =>
            allowedUpdates.includes(k)
        );

        if (!isUpdateAllowed) {
            throw new Error("Update not allowed");
        }

        if (data?.skills.length > 10) {
            throw new Error("User can not have more than 10 skills")
        }

        const updatedUser = await User.findByIdAndUpdate(userId, data, {
            runValidators: true,
            returnDocument: "after"
        })
        res.send("user updated successfully" + updatedUser)

    } catch (err) {
        res.send(err.message)
    }
})


app.delete("/delete", async (req, res) => {
    const userId = req.body.userId;
    try {
        const usersId = await User.findByIdAndDelete(userId, {
            returnDocument: "after"
        });
        console.log(usersId)
        res.send("user deleted")

    } catch (err) {
        res.send(err.message)
    }

})


connectDB()
    .then(() => {
        console.log("Databsse connection established")

        app.listen(port, (req, res) => {
            console.log(`Server is listening on port:${port}`)
        })
    }

    )
    .catch((err) => {
        console.console.error("Database cannot be connected");
    })

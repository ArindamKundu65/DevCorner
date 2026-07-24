import express from "express";
import { validateSignUpData } from "../utils/validation.js";
import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const authRouter = express.Router();


authRouter.post("/signup", async (req, res) => {

    try {
        //Validation of data
        validateSignUpData(req);

        const { firstName, lastName, emailId, password, skills, age, gender, photoUrl } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash);


        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            skills,
            gender,
            age,
            photoUrl
        })



        const savedUser = await user.save();
        const token = await jwt.sign({_id: savedUser._id}, process.env.JWT_SECRET, {
            expiresIn: "8h"
        });
        // console.log(token)

        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 3600000)
        });

        res.json({message: "User Added successfully", data: savedUser});
    } catch (error) {
        res.status(404).send(`Error: ${error.message}`);

    }
});

authRouter.post("/login",async (req, res)=>{
    try {
        const {emailId, password} = req.body;

        const user = await User.findOne({emailId});
        if (!user) {
            throw new Error("invalid credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {


            const token = await jwt.sign({_id: user._id}, process.env.JWT_SECRET , {
                expiresIn: "8h"
            });
            // console.log(token)

                res.cookie("token", token, {
                    expires: new Date(Date.now() + 8 * 3600000)
                });



                res.json({
                    message: "Login successful",
                    user
                });
        } else {
            throw new Error("invalid credentials")
        }
    } catch (error) {
        res.status(400).send("ERROR: "+ error.message)
    }
})



authRouter.post("/logout", async (req, res)=> {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });
    res.send("Logout Successfull");
});

export default authRouter;
import jwt from "jsonwebtoken"
import User from "../models/user.js";

const userAuth = async (req, res, next) => {
    try{

    const { token } = req.cookies;

    if(!token) {
        return res.status(401).send("Please login!")
    }

    const decodedObj = await jwt.verify(token, "Hello");

    const { _id } = decodedObj;

    const user = await User.findById(_id);

    if (!user) {
        throw new Error("User not found")
    }

    req.user = user;

    next()
}catch (error) {
    res.status(400).send("ERROR: "+ error.message)
}
};


export {userAuth}
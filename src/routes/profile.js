import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { validateSignUpData, validateEditProfileData } from "../utils/validation.js";


const profileRouter = express.Router();


profileRouter.get("/profile/view",userAuth, async (req,res) => {

    try
    {

    const user = req.user;
    if(!user) {
        throw new Error("User does not exist");
    }
    res.send(user);
}catch (error) {
    res.status(400).send("ERROR: "+ error.message)
}
});

profileRouter.patch("/profile/edit", userAuth, async (req, res)=> {
    try {
        if(!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        }
        
        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key)=> (loggedInUser[key] = req.body[key]))

            res.json({
                message: `${loggedInUser.firstName}, your profile updated successfully`,
                data: loggedInUser
            })
       await loggedInUser.save();
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }

})

export default profileRouter;
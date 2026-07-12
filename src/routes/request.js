import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { ConnectionRequest } from "../models/connectionRequest.js";
import User from "../models/user.js";


const requestRouter = express.Router();


requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {


    try {
        const fromUserId = req.user;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Invalid status type: "+ status})
        }



        const toUser = await User.findById(toUserId);

        if (!toUser){
            return res.status(404).json({
                message: "User not found"
            });
        }


        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId},
                { fromUserId: toUserId, toUserId: fromUserId },
            ]
        });
        if(existingConnectionRequest){
            return res
            .status(400)
            .send({ message: "Connection Request Already Exist!!" });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save()

        res.json({
            message: req.user.firstName+" is "+ status+ " in "+toUser.firstName,
            data
        });

        res.send(user.firstName + "sent a connection request");
    } catch (error) { }
})


export default requestRouter;
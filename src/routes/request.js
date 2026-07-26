import express from "express";
import { userAuth } from "../middlewares/auth.js";
import  ConnectionRequest  from "../models/connectionRequest.js";
import User from "../models/user.js";
import { sendConnectionRequestEmail } from "../utils/sendEmail.js";


const requestRouter = express.Router();


requestRouter.post(
    "/request/send/:status/:toUserId",
    userAuth,
    async (req, res) => {
        try {
            const fromUserId = req.user._id;
            const toUserId = req.params.toUserId;
            const status = req.params.status;

            const allowedStatus = ["ignored", "interested"];

            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status type: " + status
                });
            }

            const toUser = await User.findById(toUserId);

            if (!toUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const existingConnectionRequest =
                await ConnectionRequest.findOne({
                    $or: [
                        {
                            fromUserId,
                            toUserId
                        },
                        {
                            fromUserId: toUserId,
                            toUserId: fromUserId
                        }
                    ]
                });

            if (existingConnectionRequest) {
                return res.status(400).json({
                    message: "Connection Request Already Exist!!"
                });
            }

            // If user ignores, don't create a connection request
            if (status === "ignored") {
                return res.json({
                    message: `${req.user.firstName} ignored ${toUser.firstName}`
                });
            }

            // Create request only for "interested"
            const connectionRequest = new ConnectionRequest({
                fromUserId,
                toUserId,
                status
            });

            const data = await connectionRequest.save();

            // Send email to receiver
            if (status === "interested") {
                try {
                    await sendConnectionRequestEmail(
                        toUser.emailId,
                        toUser.firstName,
                        req.user.firstName
                    );
                } catch (error) {
                    console.error(
                        "Failed to send connection request email:",
                        error.message
                    );
                }
            }

            if (status === "interested") {
                console.log("Sending email to:", toUser.emailId);
            
                try {
                    await sendConnectionRequestEmail(
                        toUser.emailId,
                        toUser.firstName,
                        req.user.firstName
                    );
            
                    console.log("Email sent successfully");
                } catch (error) {
                    console.error("Email failed:", error);
                }
            }

            res.json({
                message: `${req.user.firstName} is interested in ${toUser.firstName}`,
                data
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: error.message
            });
        }
    }
);

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res)=> {

    try {
        const loggedInUser = req.user;
        const {status, requestId} = req.params;

        console.log(requestId);
console.log(loggedInUser._id);

const doc = await ConnectionRequest.findById(requestId);
console.log(doc);

        const allowedStatus = ["accepted","rejected"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Status not allowed"});
        }

        const connectionRequest = await ConnectionRequest.findOne({ 
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });
        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found" });
        }
        

        connectionRequest.status = status;

        const data = await connectionRequest.save();
        

        res.json({ message: "Connection request "+status, data });


    } catch (error) {
        res.status(400).send("ERROR: "+ error.message)
    }


})

export default requestRouter;
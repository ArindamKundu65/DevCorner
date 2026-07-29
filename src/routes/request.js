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
        const { toUserId, status } = req.params;
  
        const allowedStatus = ["ignored", "interested"];
  
        if (!allowedStatus.includes(status)) {
          return res.status(400).json({
            message: "Invalid status type: " + status,
          });
        }
  
        const toUser = await User.findById(toUserId);
  
        if (!toUser) {
          return res.status(404).json({
            message: "User not found",
          });
        }
  
        const existingConnectionRequest = await ConnectionRequest.findOne({
          $or: [
            { fromUserId, toUserId },
            { fromUserId: toUserId, toUserId: fromUserId },
          ],
        });
  
        if (existingConnectionRequest) {
          return res.status(400).json({
            message: "Connection Request Already Exists!!",
          });
        }
  
        const connectionRequest = new ConnectionRequest({
          fromUserId,
          toUserId,
          status,
        });
  
        const data = await connectionRequest.save();
  
        if (status === "interested") {
          try {
            console.log("Sending email to:", toUser.emailId);
  
            await sendConnectionRequestEmail(
              toUser.emailId,
              toUser.firstName,
              req.user.firstName
            );
  
            console.log("Email sent successfully");
          } catch (error) {
            console.error("Email failed:", error.message);
          }
        }
  
        res.json({
          message: `${req.user.firstName} ${status} ${toUser.firstName}`,
          data,
        });
      } catch (error) {
        console.error(error);
  
        res.status(500).json({
          message: error.message,
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
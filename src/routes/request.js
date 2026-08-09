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
  
        console.log("✅ Request saved");

        if (status === "interested") {
            console.log("Before email");
        
            try {
                await sendConnectionRequestEmail(
                    toUser.emailId,
                    toUser.firstName,
                    req.user.firstName
                );
        
                console.log("After email");
            } catch (error) {
                console.log("Email error:", error);
            }
        }
        
        console.log("Before response");
        
        res.json({
            message: `${req.user.firstName} is interested in ${toUser.firstName}`,
            data
        });
        
        console.log("After response");
      } catch (error) {
        console.error(error);
  
        res.status(500).json({
          message: error.message,
        });
      }
    }
  );

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
  
  
        // ==============================
        // SILVER MEMBERSHIP LIMIT
        // ==============================
  
        if (req.user.membershipType === "silver") {
  
          const today = new Date().toISOString().split("T")[0];
  
          // If this is a new day, reset the counter
          if (req.user.connectionRequestDate !== today) {
  
            req.user.connectionRequestCount = 0;
            req.user.connectionRequestDate = today;
          }
  
          // Check daily limit
          if (req.user.connectionRequestCount >= 100) {
            return res.status(429).json({
              message: "You have reached your daily limit of 100 connection requests.",
            });
          }
  
          // Increase count
          req.user.connectionRequestCount += 1;
  
          await req.user.save();
        }
  
  
        // ==============================
        // CREATE CONNECTION REQUEST
        // ==============================
  
        const connectionRequest = new ConnectionRequest({
          fromUserId,
          toUserId,
          status,
        });
  
        const data = await connectionRequest.save();
  
        console.log("✅ Request saved");
  
        if (status === "interested") {
          console.log("Before email");
  
          try {
            await sendConnectionRequestEmail(
              toUser.emailId,
              toUser.firstName,
              req.user.firstName
            );
  
            console.log("After email");
          } catch (error) {
            console.log("Email error:", error);
          }
        }
  
        console.log("Before response");
  
        res.json({
          message: `${req.user.firstName} is interested in ${toUser.firstName}`,
          data,
        });
  
        console.log("After response");
  
      } catch (error) {
        console.error(error);
  
        res.status(500).json({
          message: error.message,
        });
      }
    }
  );

export default requestRouter;
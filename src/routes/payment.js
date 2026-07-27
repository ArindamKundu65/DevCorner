import express from "express"
import { userAuth } from "../middlewares/auth.js";
import razorPayInstance from "../utils/razorpay.js"
import Payment from "../models/payment.js";
import { memberShipAmount } from "../utils/constants.js";


const paymentRouter = express.Router();


paymentRouter.post("/payment/create", userAuth, async (req, res)=> {

    try {

        const {memberShipType} = req.body;
        const { firstName, lastName, emailId } = req.user;


       const order = await razorPayInstance.orders.create({
            amount: memberShipAmount[memberShipType] * 100,
            currency: "INR",
            receipt: "receipt#1",
            partial_payment: false,
            notes: {
              firstName,
              lastName,
              emailId,
              memberShipType: memberShipType
            }
          });

          console.log(order);
          const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount:order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
          })

          const savedPayment = await payment.save();

          res.json({...savedPayment._doc, keyId: process.env.RAZORPAY_KEY_ID})
        
    } catch (error) {
        return res.status(500).json({ msg: error.message})
        
    }


})


export default paymentRouter
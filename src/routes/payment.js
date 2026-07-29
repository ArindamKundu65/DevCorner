import express from "express"
import { userAuth } from "../middlewares/auth.js";
import razorPayInstance from "../utils/razorpay.js"
import Payment from "../models/payment.js";
import { memberShipAmount } from "../utils/constants.js";
import User from "../models/user.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";

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

paymentRouter.post("/payment/webhook", async (req, res) => {
  console.log("🔥 WEBHOOK RECEIVED");
  console.log("Webhook body:", JSON.stringify(req.body, null, 2));

  try {
      const webhookSignature = req.get("X-Razorpay-Signature");

      const isWebHookValid = validateWebhookSignature(
          JSON.stringify(req.body),
          webhookSignature,
          process.env.RAZORPAY_WEBHOOK_SECRET
      );

      if (!isWebHookValid) {
          console.log("❌ Invalid webhook signature");

          return res.status(400).json({
              msg: "Webhook signature is invalid"
          });
      }

      console.log("✅ Webhook signature valid");

      // const paymentDetails = req.body.payload.entity;

      const paymentDetails = req.body.payload.payment.entity;

      const payment = await Payment.findOne({
          orderId: paymentDetails.order_id
      });

      console.log("Payment found:", payment);

      if (!payment) {
          return res.status(404).json({
              msg: "Payment not found"
          });
      }

      payment.status = paymentDetails.status;
      await payment.save();

      const user = await User.findById(payment.userId);

      console.log("User found:", user);

      if (!user) {
          return res.status(404).json({
              msg: "User not found"
          });
      }

      user.isPremium = true;
      user.membershipType = payment.notes.memberShipType;

      await user.save();

      console.log("✅ User is now premium");

      return res.status(200).json({
          msg: "Webhook received successfully"
      });

  } catch (error) {
      console.log("❌ Webhook Error:", error);

      return res.status(500).json({
          msg: error.message
      });
  }
});

export default paymentRouter
const express = require("express");
const { userAuth } = require("../middlewares/auth");
const payementRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhooSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

payementRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const membershipType = req.body.type;
    const { firstName, lastName, emailId } = req.user;
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: firstName,
        lastName: lastName,
        email: emailId,
        membershipType: membershipType,
      },
    });
    // Save it in my database

    console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // Return back my order details to frontend
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      statusCode: 500,
      error: {
        code: "SERVER_ERROR",
        description: err.message || "Internal server error",
      },
    });
  }
});

payementRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.headers["X-Razorpay-Signature"];
    const isWebhookValid = validateWebhooSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );
    if (!isWebhookValid) {
      return res.status(400).json({ msg: "webhook signature is invalid" });
    }
    const paymentDetails = req.body.payload.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    payment.status = paymentDetails.status;
    await payment.save();
    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
    // if (req.body === "payment.captured") {
    // }
    // if (req.body === "payment.failed") {
    // }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      statusCode: 500,
      error: {
        code: "SERVER_ERROR",
        description: err.message || "Internal server error",
      },
    });
  }
});

payementRouter.get("/payment/verify", userAuth, async (req, res) => {
  try {
    const user = req.user.toJSON();
    if (user.isPremium) {
      return res.json({  ...user});
    }
    return res.json({ ...user });
  } catch (err) {
    console.error(err);
  }
});
module.exports = payementRouter;

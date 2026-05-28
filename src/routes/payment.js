const express = require("express");
const { userAuth } = require("../middlewares/auth");
const payementRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment")

payementRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const order = await razorpayInstance.orders.create({
      "amount": 50000,
      "currency": "INR",
      "receipt": "receipt#1",
      "notes": {
        "key1": "value3",
        "key2": "value2",
        "membershipType" : "silver",
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

module.exports = payementRouter;

import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const SUBSCRIPTION_AMOUNT = 49900;
export const SUBSCRIPTION_CURRENCY = "INR";
export const SUBSCRIPTION_DESCRIPTION = "Glow Premium - 1 Month";

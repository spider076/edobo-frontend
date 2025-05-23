"use client";
import React, { useEffect } from "react";
// stripe for paymen get way
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
// checkout main component import
import CheckoutMain from "./mainCheckout";
import { useRouter } from "next-nprogress-bar";
import { useSelector } from "react-redux";
// Set up the Stripe promise with your public key
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);

export default function Checkout() {
  const { isAuthenticated } = useSelector(({ user }) => user);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Clean up script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutMain />
    </Elements>
  );
}

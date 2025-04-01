// src/components/BookTour/CheckoutForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "./BookingStyles.css";

const CheckoutForm = ({ tour }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setLoading(true);
    setErrorMessage("");

    // Confirm payment
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking-success`,
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message);
      setLoading(false);
    }
    // Payment confirmation will redirect to return_url
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement />
      {errorMessage && <div className="payment-error">{errorMessage}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="payment-button"
      >
        {loading ? "Processing..." : `Pay $${tour.price}`}
      </button>
    </form>
  );
};

export default CheckoutForm;

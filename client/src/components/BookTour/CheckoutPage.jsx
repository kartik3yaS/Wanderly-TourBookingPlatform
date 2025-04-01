// src/components/BookTour/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import "./BookingStyles.css";

// Load Stripe outside of component render to avoid recreating Stripe object on every render
const stripePromise = loadStripe(
  "pk_test_51R3S9tKu084KAzpQmATjbuXcMHaRPxPGMYngxvyZ2CJdvyCIcXh1xiudKrCoWRPHGRUJSSXYiST3l30ckml8Z4zz00oIz4s8I8"
);

const CheckoutPage = () => {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const { tourId } = useParams();
  const navigate = useNavigate();

  // Stripe appearance configuration
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#55c57a",
    },
    rules: {
      ".Input": {
        border: "1px solid #ced4da",
        boxShadow: "none",
        fontSize: "16px",
      },
      ".Input:focus": {
        border: "1px solid #55c57a",
        boxShadow: "0 0 0 1px #55c57a",
      },
    },
  };

  // Stripe options
  const options = {
    clientSecret,
    appearance,
    elements: {
      expiryInput: {
        showYear: true, // Enable 4-digit year input
      },
    },
  };

  useEffect(() => {
    // Fetch tour details
    const fetchTourDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/v1/tours/${tourId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tour details");
        }

        const data = await response.json();
        setTour(data.data.data);

        // Create payment intent
        createPaymentIntent(data.data.data.price);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [tourId]);

  const createPaymentIntent = async (price) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/v1/bookings/checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tourId,
            price,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not create payment session");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Preparing your booking...</p>
      </div>
    );
  }

  if (error) {
    return <div className="checkout-error">{error}</div>;
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Complete Your Booking</h1>
      </div>

      <div className="checkout-content">
        <div className="tour-summary">
          <div className="tour-image">
            <img
              src={`http://localhost:5000/img/tours/${tour.imageCover}`}
              alt={tour.name}
            />
          </div>
          <div className="tour-info">
            <h2>{tour.name}</h2>
            <div className="tour-details">
              <p>
                <span className="detail-label">Duration:</span> {tour.duration}{" "}
                days
              </p>
              <p>
                <span className="detail-label">Starts:</span>{" "}
                {tour.startLocation?.description}
              </p>
              <p>
                <span className="detail-label">Difficulty:</span>{" "}
                {tour.difficulty}
              </p>
              <p>
                <span className="detail-label">Group Size:</span>{" "}
                {tour.maxGroupSize} people
              </p>
            </div>
            <div className="tour-price">
              <p className="price-label">Price:</p>
              <p className="price-value">
                ${tour.price} <span>per person</span>
              </p>
            </div>
          </div>
        </div>

        {clientSecret && (
          <div className="payment-section">
            <h2>Payment Information</h2>
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm tour={tour} />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

// src/components/BookTour/BookingSuccess.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./BookingStyles.css";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);
  const navigate = useNavigate();
  const paymentIntent = searchParams.get("payment_intent");

  useEffect(() => {
    if (paymentIntent) {
      // Fetch booking details based on payment intent
      fetchBookingDetails();
    } else {
      setLoading(false);
    }
  }, [paymentIntent]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v1/bookings/by-payment/${paymentIntent}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingDetails(data.data.data);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="success-loading">
        <div className="spinner"></div>
        <p>Confirming your booking...</p>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path
              fill="#55c57a"
              d="M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z"
            ></path>
          </svg>
        </div>
        <h1>Payment Successful!</h1>
        <p>Your booking has been confirmed.</p>

        {bookingDetails && (
          <div className="booking-details">
            <h2>Booking Details</h2>
            <p>
              <span>Tour:</span> {bookingDetails.tour.name}
            </p>
            <p>
              <span>Date:</span>{" "}
              {new Date(bookingDetails.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span>Price:</span> ${bookingDetails.price}
            </p>
          </div>
        )}

        <div className="success-actions">
          <button
            className="view-bookings-btn"
            onClick={() => navigate("/my-bookings")}
          >
            View My Bookings
          </button>
          <button className="home-btn" onClick={() => navigate("/dashboard")}>
            Back to Tours
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;

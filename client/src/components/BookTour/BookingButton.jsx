// src/components/BookTour/BookingButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./BookingStyles.css";

const BookingButton = ({ tourId }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/tour/${tourId}/checkout`);
  };

  return (
    <button className="book-tour-button" onClick={handleBookNow}>
      Book tour now!
    </button>
  );
};

export default BookingButton;

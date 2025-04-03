import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/BookingForm.css";

const BookingForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode] = useState(!!bookingId);
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    tour: "",
    user: "",
    price: 0,
    paid: false,
  });

  // Fetch tours and users for dropdowns
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }

    fetchToursAndUsers();
    if (isEditMode) {
      fetchBookingData();
    }
  }, [bookingId, isAdmin, navigate]);

  const fetchToursAndUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch tours
      const toursResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/tours`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch users
      const usersResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!toursResponse.ok || !usersResponse.ok) {
        throw new Error("Failed to fetch required data");
      }

      const toursData = await toursResponse.json();
      const usersData = await usersResponse.json();

      setTours(toursData.data.data);
      setUsers(usersData.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch booking data");
      }

      const data = await response.json();
      const booking = data.data.data;

      setFormData({
        tour: booking.tour._id,
        user: booking.user._id,
        price: booking.price,
        paid: booking.paid,
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditMode
        ? `${process.env.REACT_APP_API_URL}/bookings/${bookingId}`
        : `${process.env.REACT_APP_API_URL}/bookings`;
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save booking");
      }

      setSuccess(
        isEditMode
          ? "Booking updated successfully!"
          : "Booking created successfully!"
      );

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !tours.length) {
    return (
      <div className="booking-form-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <div className="booking-form-header">
        <h1>{isEditMode ? "Edit Booking" : "Create New Booking"}</h1>
        <button className="back-button" onClick={() => navigate("/admin")}>
          Back to Admin Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Booking Details</h2>

          <div className="form-group">
            <label htmlFor="tour">Tour*</label>
            <select
              id="tour"
              name="tour"
              value={formData.tour}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a tour</option>
              {tours.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.name} - ${tour.price}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="user">User*</label>
            <select
              id="user"
              name="user"
              value={formData.user}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price*</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="paid"
                checked={formData.paid}
                onChange={handleInputChange}
              />
              Payment Completed
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/admin")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Booking"
                : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;

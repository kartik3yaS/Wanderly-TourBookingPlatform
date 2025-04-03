import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user, logout, isAdmin, updateUser } = useAuth();
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingsError, setBookingsError] = useState("");
  const [reviewsError, setReviewsError] = useState("");
  const [activeTab, setActiveTab] = useState("tours");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/tours`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tours");
        }

        const data = await response.json();
        setTours(data.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  useEffect(() => {
    // Check if there are booking parameters in the URL
    const queryParams = new URLSearchParams(window.location.search);
    const tour = queryParams.get("tour");
    const user = queryParams.get("user");
    const price = queryParams.get("price");

    // If all parameters exist, create a booking
    if (tour && user && price) {
      const createBooking = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/bookings/create-booking-checkout?tour=${tour}&user=${user}&price=${price}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          // Show success message if needed
          if (data.status === "success") {
            // You could set a success message state here if desired
          }

          // Clear the URL parameters after booking is created
          window.history.replaceState({}, document.title, "/dashboard");

          // Refresh bookings if we're on the bookings tab
          if (activeTab === "bookings") {
            fetchUserBookings();
          }
        } catch (err) {
          console.error("Error creating booking:", err);
        }
      };

      createBooking();
    }
  }, [activeTab]); // Add activeTab as dependency to refresh bookings when needed

  // Fetch bookings when the bookings tab is active
  useEffect(() => {
    if (activeTab === "bookings") {
      fetchUserBookings();
    }
  }, [activeTab]);

  const fetchUserBookings = async () => {
    try {
      setBookingsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/my-bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch your bookings");
      }

      const data = await response.json();
      console.log("Full booking data:", data);
      console.log(
        "Booking tour details:",
        data.data.bookings.map((b) => ({
          tourId: b.tour?._id,
          tourName: b.tour?.name,
          imageCover: b.tour?.imageCover,
        }))
      );
      setBookings(data.data.bookings);
      setBookingsLoading(false);
    } catch (err) {
      setBookingsError(err.message);
      setBookingsLoading(false);
    }
  };

  // Add fetchUserReviews function
  const fetchUserReviews = async () => {
    try {
      setReviewsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/reviews/my-reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch your reviews");
      }

      const data = await response.json();
      console.log("Reviews data:", data);
      setReviews(data.data.reviews);
      setReviewsLoading(false);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviewsError(err.message);
      setReviewsLoading(false);
    }
  };

  // Add useEffect for reviews tab
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchUserReviews();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <h1>Natours</h1>
        </div>
        <div className="user-info">
          {isAdmin() && (
            <button className="admin-button" onClick={() => navigate("/admin")}>
              Admin Dashboard
            </button>
          )}
          <div className="user-avatar">
            {user.photo ? (
              <img
                src={`http://localhost:5000/img/users/${user.photo}`}
                alt={user.name}
              />
            ) : (
              <div className="avatar-placeholder">{user.name.charAt(0)}</div>
            )}
          </div>
          <span className="user-name">{user.name}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <nav className="dashboard-nav">
            <ul>
              <li className={activeTab === "tours" ? "active" : ""}>
                <button onClick={() => setActiveTab("tours")}>
                  <i className="icon-tours"></i>
                  Tours
                </button>
              </li>
              <li className={activeTab === "bookings" ? "active" : ""}>
                <button onClick={() => setActiveTab("bookings")}>
                  <i className="icon-bookings"></i>
                  My Bookings
                </button>
              </li>
              <li className={activeTab === "reviews" ? "active" : ""}>
                <button onClick={() => setActiveTab("reviews")}>
                  <i className="icon-reviews"></i>
                  My Reviews
                </button>
              </li>
              <li className={activeTab === "settings" ? "active" : ""}>
                <button onClick={() => setActiveTab("settings")}>
                  <i className="icon-settings"></i>
                  Settings
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="dashboard-main">
          {error && <div className="error-message">{error}</div>}

          {activeTab === "tours" && (
            <div className="tours-section">
              <h2>Available Tours</h2>
              <div className="tours-grid">
                {tours.map((tour) => (
                  <div className="tour-card" key={tour.id}>
                    <div className="tour-image">
                      <img
                        src={`http://localhost:5000/img/tours/${tour.imageCover}`}
                        alt={tour.name}
                      />
                      <span className="tour-price">${tour.price}</span>
                    </div>
                    <div className="tour-details">
                      <h3>{tour.name}</h3>
                      <div className="tour-info">
                        <span>{tour.duration} days</span>
                        <span>{tour.difficulty}</span>
                      </div>
                      <p className="tour-summary">{tour.summary}</p>
                      <div className="tour-footer">
                        <div className="tour-ratings">
                          <span className="rating">{tour.ratingsAverage}</span>
                          <span className="reviews">
                            ({tour.ratingsQuantity} reviews)
                          </span>
                        </div>
                        <button
                          className="view-details-btn"
                          onClick={() => navigate(`/tour/${tour.id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bookings-section">
              <h2>My Bookings</h2>

              {bookingsLoading && (
                <div className="bookings-loading">
                  <div className="spinner"></div>
                  <p>Loading your bookings...</p>
                </div>
              )}

              {bookingsError && (
                <div className="error-message">{bookingsError}</div>
              )}

              {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                <p className="no-bookings">You haven't booked any tours yet.</p>
              )}

              {!bookingsLoading && !bookingsError && bookings.length > 0 && (
                <div className="bookings-grid">
                  {bookings.map((booking) => {
                    console.log(
                      "Processing booking:",
                      booking.tour?.name,
                      "Image:",
                      booking.tour?.imageCover
                    );
                    return (
                      <div key={booking._id} className="booking-card">
                        <div className="booking-image">
                          {booking.tour && (
                            <img
                              src={`http://localhost:5000/img/tours/${booking.tour.imageCover}`}
                              alt={booking.tour.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/300x200?text=No+Image";
                              }}
                            />
                          )}
                        </div>
                        <div className="booking-details">
                          <h3>{booking.tour ? booking.tour.name : "Tour"}</h3>
                          <div className="booking-info">
                            <p>
                              <strong>Booked on:</strong>{" "}
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Price:</strong> ${booking.price}
                            </p>
                            <p>
                              <strong>Duration:</strong>{" "}
                              {booking.tour?.duration || "N/A"} days
                            </p>
                            <p>
                              <strong>Difficulty:</strong>{" "}
                              {booking.tour?.difficulty || "N/A"}
                            </p>
                          </div>
                          {booking.tour && (
                            <button
                              className="view-tour-btn"
                              onClick={() =>
                                navigate(`/tour/${booking.tour._id}`)
                              }
                            >
                              View Tour Details
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-section">
              <h2>My Reviews</h2>

              {reviewsLoading && (
                <div className="reviews-loading">
                  <div className="spinner"></div>
                  <p>Loading your reviews...</p>
                </div>
              )}

              {reviewsError && (
                <div className="error-message">{reviewsError}</div>
              )}

              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <p className="no-reviews">
                  You haven't written any reviews yet.
                </p>
              )}

              {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                <div className="reviews-grid">
                  {reviews.map((review) => (
                    <div className="review-card" key={review._id}>
                      <div className="review-header">
                        <div className="review-tour-info">
                          <h3>
                            {review.tour?.name || "Tour no longer available"}
                          </h3>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, index) => (
                            <span
                              key={index}
                              className={`star ${
                                index < review.rating ? "filled" : ""
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="review-content">{review.review}</p>
                      {review.tour && (
                        <button
                          className="view-tour-btn"
                          onClick={() => navigate(`/tour/${review.tour._id}`)}
                        >
                          View Tour
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <div className="settings-card">
                <h3>Your Account</h3>
                <form
                  className="settings-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const name = e.target.elements.name.value;
                    const email = e.target.elements.email.value;

                    try {
                      const token = localStorage.getItem("token");
                      const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/users/updateMe`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ name, email }),
                        }
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(
                          data.message || "Failed to update profile"
                        );
                      }

                      // Update the user context with new data using updateUser
                      if (data.data.user) {
                        updateUser({
                          ...user,
                          name: data.data.user.name,
                          email: data.data.user.email,
                        });
                        alert("Profile updated successfully!");
                      }
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                >
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user.name}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={user.email}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Photo</label>
                    <div className="photo-upload">
                      <div className="current-photo">
                        {user.photo ? (
                          <img
                            src={`http://localhost:5000/img/users/${user.photo}`}
                            alt={user.name}
                          />
                        ) : (
                          <div className="avatar-placeholder large">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          // Check file size (max 2MB)
                          if (file.size > 2 * 1024 * 1024) {
                            alert("File size must be less than 2MB");
                            return;
                          }

                          // Check file type
                          if (!file.type.startsWith("image/")) {
                            alert("Please upload an image file");
                            return;
                          }

                          try {
                            const formData = new FormData();
                            formData.append("photo", file);

                            const token = localStorage.getItem("token");
                            const response = await fetch(
                              `${process.env.REACT_APP_API_URL}/users/updateMe`,
                              {
                                method: "PATCH",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                                body: formData,
                              }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(
                                data.message || "Failed to update photo"
                              );
                            }

                            // Update the user context with new photo
                            if (data.data.user) {
                              // Update the user state in AuthContext
                              updateUser({
                                ...user,
                                photo: data.data.user.photo,
                              });
                              alert("Photo updated successfully!");
                            }
                          } catch (err) {
                            alert(err.message);
                          }
                        }}
                      />
                      <label htmlFor="photo" className="upload-btn">
                        Choose new photo
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="save-settings-btn">
                    Save Settings
                  </button>
                </form>
              </div>

              <div className="settings-card">
                <h3>Password Change</h3>
                <form
                  className="password-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const passwordCurrent =
                      e.target.elements.passwordCurrent.value;
                    const password = e.target.elements.password.value;
                    const passwordConfirm =
                      e.target.elements.passwordConfirm.value;

                    if (password !== passwordConfirm) {
                      alert("New passwords don't match!");
                      return;
                    }

                    try {
                      const token = localStorage.getItem("token");
                      const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/users/updateMyPassword`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            passwordCurrent,
                            password,
                            passwordConfirm,
                          }),
                        }
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(
                          data.message || "Failed to update password"
                        );
                      }

                      // Update token with new one from response
                      if (data.token) {
                        localStorage.setItem("token", data.token);
                      }

                      alert("Password updated successfully!");
                      // Clear the form
                      e.target.reset();
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                >
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" name="passwordCurrent" required />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength="8"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="passwordConfirm"
                      required
                      minLength="8"
                    />
                  </div>
                  <button type="submit" className="save-password-btn">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("tours");
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin()) {
      navigate("/dashboard");
    }

    // Fetch data based on active tab
    fetchData(activeTab);
  }, [activeTab, isAdmin, navigate]);

  const fetchData = async (tab) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      let endpoint;
      switch (tab) {
        case "tours":
          endpoint = "tours";
          break;
        case "users":
          endpoint = "users";
          break;
        case "bookings":
          endpoint = "bookings";
          break;
        default:
          endpoint = "tours";
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          logout(); // Log out the user
          navigate("/login"); // Redirect to login
          throw new Error("Please log in again.");
        }
        throw new Error(data.message || `Failed to fetch ${tab}`);
      }

      switch (tab) {
        case "tours":
          setTours(data.data.data);
          break;
        case "users":
          setUsers(data.data.data);
          break;
        case "bookings":
          setBookings(data.data.data);
          break;
        default:
          setTours(data.data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/tours/${tourId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete tour");
      }

      // Refresh tours list
      setTours(tours.filter((tour) => tour.id !== tourId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Don't allow deleting yourself
    if (userId === user._id) {
      setError("You cannot delete your own account while logged in.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          logout(); // Log out the user
          navigate("/login"); // Redirect to login
          throw new Error("Please log in again.");
        }
        throw new Error(data.message || "Failed to delete user");
      }

      // Remove the user from the list
      setUsers(users.filter((u) => u._id !== userId));
      setError(""); // Clear any existing errors

      // Show success message
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(""), 3000); // Clear success message after 3 seconds
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message || "Failed to delete user. Please try again.");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      // Refresh bookings list
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
      setSuccess("Booking deleted successfully");
      setTimeout(() => setSuccess(""), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading && !error) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <div className="logo">
          <h1>Natours Admin</h1>
        </div>
        <div className="user-info">
          <span className="admin-badge">Administrator</span>
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

      <div className="admin-content">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <ul>
              <li className={activeTab === "tours" ? "active" : ""}>
                <button onClick={() => setActiveTab("tours")}>
                  <i className="icon-tours"></i>
                  Manage Tours
                </button>
              </li>
              <li className={activeTab === "users" ? "active" : ""}>
                <button onClick={() => setActiveTab("users")}>
                  <i className="icon-users"></i>
                  Manage Users
                </button>
              </li>
              <li className={activeTab === "bookings" ? "active" : ""}>
                <button onClick={() => setActiveTab("bookings")}>
                  <i className="icon-bookings"></i>
                  Manage Bookings
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/dashboard")}>
                  <i className="icon-dashboard"></i>
                  User Dashboard
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="admin-main">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {activeTab === "tours" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Manage Tours</h2>
                <button
                  className="add-button"
                  onClick={() => navigate("/admin/tour/new")}
                >
                  Add New Tour
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Duration</th>
                      <th>Difficulty</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tours.map((tour) => (
                      <tr key={tour.id}>
                        <td>
                          <img
                            src={`http://localhost:5000/img/tours/${tour.imageCover}`}
                            alt={tour.name}
                            className="tour-thumbnail"
                          />
                        </td>
                        <td>{tour.name}</td>
                        <td>{tour.duration} days</td>
                        <td>{tour.difficulty}</td>
                        <td>${tour.price}</td>
                        <td>
                          {tour.ratingsAverage} ({tour.ratingsQuantity})
                        </td>
                        <td className="actions-cell">
                          <button
                            className="edit-button"
                            onClick={() => navigate(`/admin/tour/${tour.id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteTour(tour.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Manage Users</h2>
                <button
                  className="add-button"
                  onClick={() => navigate("/admin/user/new")}
                >
                  Add New User
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {user.photo ? (
                            <img
                              src={`http://localhost:5000/img/users/${user.photo}`}
                              alt={user.name}
                              className="user-thumbnail"
                            />
                          ) : (
                            <div className="user-thumbnail-placeholder">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.active ? "Yes" : "No"}</td>
                        <td className="actions-cell">
                          <button
                            className="edit-button"
                            onClick={() => navigate(`/admin/user/${user._id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Manage Bookings</h2>
                <button
                  className="add-button"
                  onClick={() => navigate("/admin/booking/new")}
                >
                  Add New Booking
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tour</th>
                      <th>User</th>
                      <th>Price</th>
                      <th>Booked On</th>
                      <th>Paid</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.tour ? booking.tour.name : "N/A"}</td>
                        <td>{booking.user ? booking.user.name : "N/A"}</td>
                        <td>${booking.price}</td>
                        <td>
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                        <td>{booking.paid ? "Yes" : "No"}</td>
                        <td className="actions-cell">
                          <button
                            className="edit-button"
                            onClick={() =>
                              navigate(`/admin/booking/${booking._id}`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteBooking(booking._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

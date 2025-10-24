import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewForm from "./Review/ReviewForm";
import "../styles/TourDetails.css";

const TourDetails = () => {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const { tourId } = useParams();
  const navigate = useNavigate();

  const fetchTourDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/tours/${tourId}`,
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourDetails();
  }, [tourId]);

  const handleBookTour = async () => {
    try {
      setBookingLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      // Create checkout session on the backend
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/checkout-session/${tourId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create booking session");
      }

      // Redirect to Stripe checkout page
      window.location.href = data.session.url;
    } catch (err) {
      setError(err.message);
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tour-loading">
        <div className="spinner"></div>
        <p>Loading tour details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="tour-not-found">
        <h2>Tour Not Found</h2>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="tour-details-container">
      <div className="back-to-dashboard">
        <button onClick={() => navigate("/dashboard")} className="back-button">
          ← Back to Dashboard
        </button>
      </div>
      <div
        className="tour-header"
        style={{
          backgroundImage: `url(${tour.imageCover})`,
        }}
      >
        <div className="tour-header-overlay">
          <h1 className="tour-name">{tour.name}</h1>
        </div>
      </div>

      <div className="tour-content">
        <div className="tour-facts">
          <div className="tour-fact">
            <i className="fact-icon duration-icon"></i>
            <span className="fact-text">{tour.duration} days</span>
          </div>
          <div className="tour-fact">
            <i className="fact-icon location-icon"></i>
            <span className="fact-text">{tour.startLocation?.description}</span>
          </div>
          <div className="tour-fact">
            <i className="fact-icon difficulty-icon"></i>
            <span className="fact-text">{tour.difficulty}</span>
          </div>
          <div className="tour-fact">
            <i className="fact-icon people-icon"></i>
            <span className="fact-text">{tour.maxGroupSize} people</span>
          </div>
        </div>

        <div className="tour-description-box">
          <h2>About {tour.name}</h2>
          <p className="tour-description">{tour.description}</p>
        </div>

        <div className="tour-images">
          {tour.images?.map((image, index) => (
            <div key={index} className="tour-image">
              <img
                src={image}
                alt={`Tour ${index + 1}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            </div>
          ))}
        </div>

        <div className="tour-locations">
          <h2>Tour Locations</h2>
          <div className="locations-list">
            {tour.locations?.map((location, index) => (
              <div key={index} className="location-item">
                <div className="location-day">Day {index + 1}</div>
                <div className="location-name">{location.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="tour-reviews">
          <h2>Reviews</h2>
          <ReviewForm tourId={tourId} onReviewSubmitted={fetchTourDetails} />
          {tour.reviews?.length > 0 ? (
            <div className="reviews-list">
              {tour.reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-user">
                    <img
                      src={`http://localhost:5000/img/users/${review.user?.photo || "default.jpg"}`}
                      alt={review.user?.name || "User"}
                      className="review-user-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/40?text=User";
                      }}
                    />
                    <span className="review-user-name">
                      {review.user?.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`star ${i < review.rating ? "filled" : ""}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="review-text">{review.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet</p>
          )}
        </div>

        <div className="tour-cta">
          <div className="tour-price">
            <p>
              <span>${tour.price}</span> per person
            </p>
            <p>
              {tour.ratingsAverage} rating ({tour.ratingsQuantity} reviews)
            </p>
          </div>
          <button
            className={`book-button ${bookingLoading ? "loading" : ""}`}
            onClick={handleBookTour}
            disabled={bookingLoading}
          >
            {bookingLoading ? "Processing..." : "Book tour now!"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;

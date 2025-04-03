import React, { useState, useEffect } from "react";
import "./ReviewStyles.css";

const ReviewForm = ({ tourId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);

  // Check if user has already reviewed this tour
  useEffect(() => {
    const checkExistingReview = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/tours/${tourId}/reviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const userReviews = data.data.data.filter(
            (review) =>
              review.user._id === JSON.parse(localStorage.getItem("user")).id
          );
          if (userReviews.length > 0) {
            setHasReviewed(true);
            setError(
              "You have already reviewed this tour. You can only review a tour once."
            );
          }
        }
      } catch (err) {
        console.error("Error checking existing review:", err);
      }
    };

    checkExistingReview();
  }, [tourId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasReviewed) {
      setError(
        "You have already reviewed this tour. You can only review a tour once."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/tours/${tourId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            review,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === 11000) {
          setHasReviewed(true);
          throw new Error(
            "You have already reviewed this tour. You can only review a tour once."
          );
        }
        throw new Error(data.message || "Could not submit review");
      }

      setSuccess("Review submitted successfully!");
      setReview("");
      setRating(5);
      setHasReviewed(true);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (hasReviewed) {
    return (
      <div className="review-form-container">
        <div className="review-notice">
          You have already reviewed this tour. Thank you for your feedback!
        </div>
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      {error && <div className="review-error">{error}</div>}
      {success && <div className="review-success">{success}</div>}
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-input">
          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${star <= rating ? "selected" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="review-input">
          <label htmlFor="review">Your Review:</label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
            placeholder="Share your experience with this tour..."
            rows="4"
          />
        </div>
        <button
          type="submit"
          className="submit-review-button"
          disabled={loading || hasReviewed}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;

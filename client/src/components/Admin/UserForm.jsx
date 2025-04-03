// src/components/Admin/UserForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/UserForm.css";

const UserForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user: currentUser, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(!!userId);
  const [imagePreview, setImagePreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "user",
    photo: null,
    active: true,
  });

  // Fetch user data if in edit mode
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }

    if (isEditMode) {
      fetchUserData();
    }
  }, [userId, isAdmin, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any existing errors
      const token = localStorage.getItem("token");

      console.log("Fetching user data for ID:", userId);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user data");
      }

      if (!data.data || !data.data.data) {
        throw new Error("User data not found");
      }

      const user = data.data.data;
      console.log("Fetched user data:", user);

      // Prepare data for form (excluding password fields)
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        passwordConfirm: "",
        role: user.role || "user",
        photo: null, // Can't pre-fill file inputs
        active: user.active !== false, // Default to true if not specified
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message || "Failed to fetch user data. Please try again.");
      setLoading(false);

      // Redirect back to admin dashboard after a delay if user not found
      if (err.message === "User data not found") {
        setTimeout(() => {
          navigate("/admin");
        }, 3000);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox inputs
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    const file = files[0];

    if (file) {
      setFormData({
        ...formData,
        photo: file,
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const removeImage = () => {
    setFormData({
      ...formData,
      photo: null,
    });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted, starting user creation...");
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Validate passwords match before submitting
      if (!isEditMode && formData.password !== formData.passwordConfirm) {
        throw new Error("Passwords do not match!");
      }

      // Create FormData object for file upload
      const formDataObj = new FormData();

      // Add user data
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);

      // Only include password fields if they're filled or it's a new user
      if (!isEditMode || (formData.password && formData.passwordConfirm)) {
        formDataObj.append("password", formData.password);
        formDataObj.append("passwordConfirm", formData.passwordConfirm);
      }

      formDataObj.append("role", formData.role);
      formDataObj.append("active", formData.active);

      // Add photo if selected
      if (formData.photo) {
        formDataObj.append("photo", formData.photo);
      }

      // Determine if creating or updating
      let url, method;

      if (isEditMode) {
        url = `${process.env.REACT_APP_API_URL}/users/${userId}`;
        method = "PATCH";
      } else {
        url = `${process.env.REACT_APP_API_URL}/users`;
        method = "POST";
      }

      console.log("Submitting to URL:", url, "with method:", method);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - browser will set it automatically for FormData
        },
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate email error specifically
        if (data.error?.code === 11000) {
          throw new Error(
            "This email is already registered. Please use a different email address."
          );
        }
        throw new Error(data.message || "Failed to save user");
      }

      // If we're updating the currently logged-in user, update the auth context
      if (isEditMode && userId === currentUser._id) {
        const updatedUser = data.data.user;
        const storedToken = localStorage.getItem("token");
        login(updatedUser, storedToken);
      }

      setSuccess(
        isEditMode ? "User updated successfully!" : "User created successfully!"
      );

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (err) {
      console.error("Error creating/updating user:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.name) {
    return (
      <div className="user-form-loading">
        <div className="spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="user-form-container">
      <div className="user-form-header">
        <h1>{isEditMode ? "Edit User" : "Create New User"}</h1>
        <button className="back-button" onClick={() => navigate("/admin")}>
          Back to Admin Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form
        className="user-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="name">Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role*</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="user">User</option>
              <option value="guide">Guide</option>
              <option value="lead-guide">Lead Guide</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
              />
              Active User
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>Password</h2>
          <p className="section-note">
            {isEditMode
              ? "Leave blank to keep current password"
              : "Password must be at least 8 characters long"}
          </p>

          <div className="form-group">
            <label htmlFor="password">
              {isEditMode ? "New Password" : "Password*"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              minLength="8"
              required={!isEditMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">
              {isEditMode ? "Confirm New Password" : "Confirm Password*"}
            </label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              minLength="8"
              required={!isEditMode}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Profile Photo</h2>

          <div className="form-group">
            <label htmlFor="photo">User Photo</label>
            <div className="file-input-container">
              <div className="file-input-wrapper">
                <button type="button" className="file-input-button">
                  {formData.photo ? "Change Photo" : "Choose Photo"}
                </button>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                />
              </div>
              {formData.photo && (
                <div className="selected-file-name">
                  Selected: {formData.photo.name}
                </div>
              )}
              {imagePreview && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={imagePreview} alt="Profile preview" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={removeImage}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
            {isEditMode && (
              <p className="file-note">Leave empty to keep current photo</p>
            )}
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
            {loading ? "Saving..." : isEditMode ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

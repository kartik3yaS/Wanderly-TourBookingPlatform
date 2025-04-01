// src/components/Admin/TourForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/TourForm.css";

const TourForm = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(!!tourId);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    duration: 0,
    maxGroupSize: 0,
    difficulty: "medium",
    price: 0,
    summary: "",
    description: "",
    imageCover: null,
    images: [],
    startDates: [""],
    startLocation: {
      description: "",
      address: "",
      coordinates: [0, 0],
    },
    locations: [
      {
        description: "",
        day: 1,
        coordinates: [0, 0],
      },
    ],
    guides: [],
  });

  // Add these state variables at the top with other state declarations
  const [imagePreviews, setImagePreviews] = useState({
    cover: null,
    tour: [],
  });

  // Fetch tour data if in edit mode
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }

    if (isEditMode) {
      fetchTourData();
    }
  }, [tourId, isAdmin, navigate]);

  const fetchTourData = async () => {
    try {
      setLoading(true);
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
        throw new Error("Failed to fetch tour data");
      }

      const data = await response.json();
      const tour = data.data.data;

      // Prepare data for form
      setFormData({
        name: tour.name || "",
        duration: tour.duration || 0,
        maxGroupSize: tour.maxGroupSize || 0,
        difficulty: tour.difficulty || "medium",
        price: tour.price || 0,
        summary: tour.summary || "",
        description: tour.description || "",
        imageCover: null, // Can't pre-fill file inputs
        images: [], // Can't pre-fill file inputs
        startDates: tour.startDates?.length
          ? tour.startDates.map(
              (date) => new Date(date).toISOString().split("T")[0]
            )
          : [""],
        startLocation: tour.startLocation || {
          description: "",
          address: "",
          coordinates: [0, 0],
        },
        locations: tour.locations?.length
          ? tour.locations
          : [
              {
                description: "",
                day: 1,
                coordinates: [0, 0],
              },
            ],
        guides: tour.guides?.map((guide) => guide.id || guide) || [],
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "imageCover") {
      setFormData({
        ...formData,
        imageCover: files[0],
      });
      // Create preview URL for cover image
      if (files[0]) {
        setImagePreviews((prev) => ({
          ...prev,
          cover: URL.createObjectURL(files[0]),
        }));
      }
    } else if (name === "images") {
      // Convert FileList to array
      const imagesArray = Array.from(files);
      setFormData({
        ...formData,
        images: imagesArray,
      });
      // Create preview URLs for tour images
      const imageUrls = imagesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => ({
        ...prev,
        tour: imageUrls,
      }));
    }
  };

  // Add cleanup function for preview URLs
  useEffect(() => {
    return () => {
      // Cleanup preview URLs when component unmounts
      if (imagePreviews.cover) {
        URL.revokeObjectURL(imagePreviews.cover);
      }
      imagePreviews.tour.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const removeImage = (type, index) => {
    if (type === "cover") {
      setFormData((prev) => ({
        ...prev,
        imageCover: null,
      }));
      setImagePreviews((prev) => ({
        ...prev,
        cover: null,
      }));
    } else {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        images: newImages,
      }));
      const newPreviews = [...imagePreviews.tour];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setImagePreviews((prev) => ({
        ...prev,
        tour: newPreviews,
      }));
    }
  };

  const handleStartDateChange = (index, value) => {
    const newStartDates = [...formData.startDates];
    newStartDates[index] = value;
    setFormData({
      ...formData,
      startDates: newStartDates,
    });
  };

  const addStartDate = () => {
    setFormData({
      ...formData,
      startDates: [...formData.startDates, ""],
    });
  };

  const removeStartDate = (index) => {
    const newStartDates = [...formData.startDates];
    newStartDates.splice(index, 1);
    setFormData({
      ...formData,
      startDates: newStartDates,
    });
  };

  const handleLocationChange = (index, field, value) => {
    const newLocations = [...formData.locations];

    if (field === "coordinates") {
      const [lat, lng] = value
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      newLocations[index].coordinates = [lng, lat]; // GeoJSON format: [longitude, latitude]
    } else {
      newLocations[index][field] =
        field === "day" ? parseInt(value, 10) : value;
    }

    setFormData({
      ...formData,
      locations: newLocations,
    });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [
        ...formData.locations,
        {
          description: "",
          day: formData.locations.length + 1,
          coordinates: [0, 0],
        },
      ],
    });
  };

  const removeLocation = (index) => {
    const newLocations = [...formData.locations];
    newLocations.splice(index, 1);

    // Update day numbers
    newLocations.forEach((loc, i) => {
      loc.day = i + 1;
    });

    setFormData({
      ...formData,
      locations: newLocations,
    });
  };

  const handleStartLocationCoordinatesChange = (value) => {
    const [lat, lng] = value
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    setFormData({
      ...formData,
      startLocation: {
        ...formData.startLocation,
        coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Create FormData object for file uploads
      const formDataObj = new FormData();

      // Add basic tour data
      formDataObj.append("name", formData.name);
      formDataObj.append("duration", formData.duration);
      formDataObj.append("maxGroupSize", formData.maxGroupSize);
      formDataObj.append("difficulty", formData.difficulty);
      formDataObj.append("price", formData.price);
      formDataObj.append("summary", formData.summary);
      formDataObj.append("description", formData.description);

      // Add start dates
      formData.startDates.forEach((date, index) => {
        if (date) formDataObj.append(`startDates[${index}]`, date);
      });

      // Add start location
      formDataObj.append(
        "startLocation[description]",
        formData.startLocation.description
      );
      formDataObj.append(
        "startLocation[address]",
        formData.startLocation.address
      );
      formDataObj.append(
        "startLocation[coordinates][0]",
        formData.startLocation.coordinates[0]
      );
      formDataObj.append(
        "startLocation[coordinates][1]",
        formData.startLocation.coordinates[1]
      );

      // Add locations
      formData.locations.forEach((location, index) => {
        formDataObj.append(
          `locations[${index}][description]`,
          location.description
        );
        formDataObj.append(`locations[${index}][day]`, location.day);
        formDataObj.append(
          `locations[${index}][coordinates][0]`,
          location.coordinates[0]
        );
        formDataObj.append(
          `locations[${index}][coordinates][1]`,
          location.coordinates[1]
        );
      });

      // Add guides
      formData.guides.forEach((guide, index) => {
        formDataObj.append(`guides[${index}]`, guide);
      });

      // Add images
      if (formData.imageCover) {
        formDataObj.append("imageCover", formData.imageCover);
      }

      if (formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          formDataObj.append("images", image);
        });
      }

      // Determine if creating or updating
      const url = isEditMode
        ? `http://localhost:5000/api/v1/tours/${tourId}`
        : "http://localhost:5000/api/v1/tours";

      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save tour");
      }

      const data = await response.json();
      setSuccess(
        isEditMode ? "Tour updated successfully!" : "Tour created successfully!"
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

  if (loading && !formData.name) {
    return (
      <div className="tour-form-loading">
        <div className="spinner"></div>
        <p>Loading tour data...</p>
      </div>
    );
  }

  return (
    <div className="tour-form-container">
      <div className="tour-form-header">
        <h1>{isEditMode ? "Edit Tour" : "Create New Tour"}</h1>
        <button className="back-button" onClick={() => navigate("/admin")}>
          Back to Admin Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="tour-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="name">Tour Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (days)*</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxGroupSize">Max Group Size*</label>
              <input
                type="number"
                id="maxGroupSize"
                name="maxGroupSize"
                value={formData.maxGroupSize}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty*</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
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
          </div>

          <div className="form-group">
            <label htmlFor="summary">Summary*</label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              required
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h2>Images</h2>

          <div className="form-group">
            <label htmlFor="imageCover">Cover Image*</label>
            <div className="file-input-container">
              <div className="file-input-wrapper">
                <button type="button" className="file-input-button">
                  {formData.imageCover
                    ? "Change Cover Image"
                    : "Choose Cover Image"}
                </button>
                <input
                  type="file"
                  id="imageCover"
                  name="imageCover"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                  required={!isEditMode}
                />
              </div>
              {formData.imageCover && (
                <div className="selected-file-name">
                  Selected: {formData.imageCover.name}
                </div>
              )}
              {imagePreviews.cover && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={imagePreviews.cover} alt="Cover preview" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage("cover")}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
            {isEditMode && (
              <p className="file-note">Leave empty to keep current image</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="images">Tour Images (up to 3)</label>
            <div className="file-input-container">
              <div className="file-input-wrapper">
                <button type="button" className="file-input-button">
                  {formData.images.length
                    ? "Add More Images"
                    : "Choose Tour Images"}
                </button>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  max="3"
                  className="file-input"
                />
              </div>
              {formData.images.length > 0 && (
                <div className="selected-file-name">
                  Selected: {formData.images.length} image(s)
                </div>
              )}
              {imagePreviews.tour.length > 0 && (
                <div className="image-preview-container">
                  {imagePreviews.tour.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Tour preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage("tour", index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isEditMode && (
              <p className="file-note">Leave empty to keep current images</p>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Start Location</h2>

          <div className="form-group">
            <label htmlFor="startLocation.description">Description*</label>
            <input
              type="text"
              id="startLocation.description"
              name="startLocation.description"
              value={formData.startLocation.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startLocation.address">Address*</label>
            <input
              type="text"
              id="startLocation.address"
              name="startLocation.address"
              value={formData.startLocation.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startLocationCoordinates">
              Coordinates (lat, lng)*
            </label>
            <input
              type="text"
              id="startLocationCoordinates"
              value={`${formData.startLocation.coordinates[1]}, ${formData.startLocation.coordinates[0]}`}
              onChange={(e) =>
                handleStartLocationCoordinatesChange(e.target.value)
              }
              placeholder="e.g. 40.712776, -74.005974"
              required
            />
            <p className="input-help">Enter as latitude, longitude</p>
          </div>
        </div>

        <div className="form-section">
          <h2>Tour Dates</h2>

          {formData.startDates.map((date, index) => (
            <div className="form-row" key={`date-${index}`}>
              <div className="form-group date-input">
                <label htmlFor={`startDate-${index}`}>Date {index + 1}</label>
                <input
                  type="date"
                  id={`startDate-${index}`}
                  value={date}
                  onChange={(e) => handleStartDateChange(index, e.target.value)}
                  required
                />
              </div>

              <button
                type="button"
                className="remove-button"
                onClick={() => removeStartDate(index)}
                disabled={formData.startDates.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}

          <button type="button" className="add-button" onClick={addStartDate}>
            Add Tour Date
          </button>
        </div>

        <div className="form-section">
          <h2>Tour Locations</h2>

          {formData.locations.map((location, index) => (
            <div className="location-item" key={`location-${index}`}>
              <h3>Location {index + 1}</h3>

              <div className="form-group">
                <label htmlFor={`location-description-${index}`}>
                  Description*
                </label>
                <input
                  type="text"
                  id={`location-description-${index}`}
                  value={location.description}
                  onChange={(e) =>
                    handleLocationChange(index, "description", e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`location-day-${index}`}>Day*</label>
                <input
                  type="number"
                  id={`location-day-${index}`}
                  value={location.day}
                  onChange={(e) =>
                    handleLocationChange(index, "day", e.target.value)
                  }
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`location-coordinates-${index}`}>
                  Coordinates (lat, lng)*
                </label>
                <input
                  type="text"
                  id={`location-coordinates-${index}`}
                  value={`${location.coordinates[1]}, ${location.coordinates[0]}`}
                  onChange={(e) =>
                    handleLocationChange(index, "coordinates", e.target.value)
                  }
                  placeholder="e.g. 40.712776, -74.005974"
                  required
                />
                <p className="input-help">Enter as latitude, longitude</p>
              </div>

              <button
                type="button"
                className="remove-button"
                onClick={() => removeLocation(index)}
                disabled={formData.locations.length <= 1}
              >
                Remove Location
              </button>
            </div>
          ))}

          <button type="button" className="add-button" onClick={addLocation}>
            Add Location
          </button>
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
            {loading ? "Saving..." : isEditMode ? "Update Tour" : "Create Tour"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourForm;

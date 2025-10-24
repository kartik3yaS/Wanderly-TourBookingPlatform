import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with:", { email });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      console.log("Server response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json(); // Read as JSON
        console.error("Login error:", errorData);
        setError(errorData.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Server response data:", data);

      // Get token from either cookie or response
      const token = data.token;

      if (!token || !data.data || !data.data.user) {
        console.error("Invalid response structure:", { data });
        throw new Error("Invalid response from server");
      }

      console.log("Login successful, storing data...");
      // Update context with user data and token
      login(data.data.user, token);

      // Redirect based on user role
      if (
        data.data.user.role === "admin" ||
        data.data.user.role === "lead-guide"
      ) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <h1>Please Log In</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="signup-link">
        <p>
          Don't have an account? <a href="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

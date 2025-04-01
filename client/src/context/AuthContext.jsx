// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        const cookies = document.cookie.split(";");
        const jwtCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("jwt=")
        );

        // Prefer cookie token over localStorage token
        const validToken = jwtCookie ? jwtCookie.split("=")[1] : token;

        if (storedUser && validToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Update token in localStorage if we got it from cookie
            if (jwtCookie && token !== validToken) {
              localStorage.setItem("token", validToken);
            }
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  const isAdmin = () => {
    return user && (user.role === "admin" || user.role === "lead-guide");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAdmin, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

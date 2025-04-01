import React, { createContext, useState } from "react";

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type, message, timeout = 5000) => {
    setAlert({ show: true, type, message });

    // Auto-hide the alert after timeout
    if (timeout > 0) {
      setTimeout(() => {
        hideAlert();
      }, timeout);
    }
  };

  const hideAlert = () => {
    setAlert({ show: false, type: "", message: "" });
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

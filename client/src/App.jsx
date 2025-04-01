// // src/App.jsx
// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import Login from "./components/Login";
// import Dashboard from "./components/Dashboard";
// import TourDetails from "./components/TourDetails";
// import CheckoutPage from "./components/BookTour/CheckoutPage";
// import BookingSuccess from "./components/BookTour/BookingSuccess";
// import ProtectedRoute from "./components/ProtectedRoute";

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/tour/:tourId"
//             element={
//               <ProtectedRoute>
//                 <TourDetails />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/tour/:tourId/checkout"
//             element={
//               <ProtectedRoute>
//                 <CheckoutPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/booking-success"
//             element={
//               <ProtectedRoute>
//                 <BookingSuccess />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/my-bookings"
//             element={
//               <ProtectedRoute>
//                 <Dashboard activeTab="bookings" />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/" element={<Navigate to="/dashboard" />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import TourDetails from "./components/TourDetails";
import CheckoutPage from "./components/BookTour/CheckoutPage";
import BookingSuccess from "./components/BookTour/BookingSuccess";
import AdminDashboard from "./components/Admin/AdminDashboard";
import TourForm from "./components/Admin/TourForm";
import UserForm from "./components/Admin/UserForm";
import BookingForm from "./components/Admin/BookingForm";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/Admin/AdminRoute";
import Signup from "./components/Signup";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tour/:tourId"
              element={
                <ProtectedRoute>
                  <TourDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tour/:tourId/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-success"
              element={
                <ProtectedRoute>
                  <BookingSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <Dashboard activeTab="bookings" />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/tour/new"
              element={
                <AdminRoute>
                  <TourForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/tour/:tourId"
              element={
                <AdminRoute>
                  <TourForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/user/new"
              element={
                <AdminRoute>
                  <UserForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/user/:userId"
              element={
                <AdminRoute>
                  <UserForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/booking/new"
              element={
                <AdminRoute>
                  <BookingForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/booking/:bookingId"
              element={
                <AdminRoute>
                  <BookingForm />
                </AdminRoute>
              }
            />
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

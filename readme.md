# Natours - Adventure Tours Application

![Natours Logo](https://res.cloudinary.com/dh44xrr1z/image/upload/v1761305994/tours/tours/tour-6-cover.jpg)

## 🌟 Overview

Natours is a modern, full-stack web application for booking adventure tours. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js), it provides a seamless experience for users to discover, review, and book tours.

## ✨ Features

### User Features

- **Authentication**

  - Sign up with email verification
  - Login with JWT authentication
  - Password reset functionality
  - Secure cookie-based authentication

- **Tour Management**

  - Browse available tours
  - View detailed tour information
  - See tour locations on an interactive map
  - View tour reviews and ratings
  - Book tours with secure payment

- **User Profile**

  - Update personal information
  - Change password
  - View booking history
  - Upload profile photo

- **Reviews & Ratings**
  - Leave reviews for booked tours
  - Rate tours out of 5 stars
  - View other users' reviews

### Admin Features

- **Tour Management**

  - Create new tours
  - Update existing tours
  - Delete tours
  - Manage tour images

- **User Management**

  - View all users
  - Update user roles
  - Delete users
  - Manage user permissions

- **Booking Management**
  - View all bookings
  - Manage booking status
  - Process refunds

## 🛠 Technical Stack

### Frontend

- **React.js** - UI library
- **React Router** - Navigation
- **Context API** - State management
- **CSS Modules** - Styling
- **Stripe** - Payment processing

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Stripe** - Payment processing

### Security Features

- Password encryption
- JWT authentication
- Data sanitization
- Rate limiting
- CORS
- XSS protection
- Parameter pollution prevention

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kartik3yaS/Tour-WebApp.git
   cd natours
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   ```bash
   # In server directory, create config.env file
   NODE_ENV=development
   PORT=5000
   DATABASE=your_mongodb_connection_string
   DATABASE_PASSWORD=your_database_password
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Start the application**

   ```bash
   # Start backend server (from server directory)
   npm start

   # Start frontend development server (from client directory)
   npm start
   ```

## 🚀 Usage

### User Journey

1. Sign up for an account
2. Browse available tours
3. View tour details and reviews
4. Book a tour using Stripe payment
5. Leave reviews for booked tours
6. Manage profile and view booking history

### Admin Journey

1. Access admin dashboard
2. Manage tours, users, and bookings
3. View statistics and reports
4. Process refunds and manage payments

## 💻 API Documentation

### Authentication Endpoints

- POST `/api/v1/users/signup` - Register new user
- POST `/api/v1/users/login` - User login
- POST `/api/v1/users/forgotPassword` - Request password reset
- PATCH `/api/v1/users/resetPassword` - Reset password

### Tour Endpoints

- GET `/api/v1/tours` - Get all tours
- GET `/api/v1/tours/:id` - Get specific tour
- POST `/api/v1/tours` - Create new tour (admin only)
- PATCH `/api/v1/tours/:id` - Update tour (admin only)
- DELETE `/api/v1/tours/:id` - Delete tour (admin only)

### Booking Endpoints

- GET `/api/v1/bookings` - Get all bookings
- POST `/api/v1/bookings/checkout-session/:tourId` - Create checkout session
- GET `/api/v1/bookings/my-bookings` - Get user's bookings

## 🔒 Security

- Implements CORS protection
- Rate limiting for API requests
- Data sanitization against NoSQL query injection
- XSS protection
- Prevention of parameter pollution
- Secure HTTP headers with Helmet

## 🎨 Styling

The application uses a modern, responsive design with:

- Clean, minimalist UI
- Consistent color scheme
- Responsive layouts
- Dark mode support
- Smooth animations
- Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors

- Kartikeya Shukla

---

Made with ❤️ by Kartikeya Shukla

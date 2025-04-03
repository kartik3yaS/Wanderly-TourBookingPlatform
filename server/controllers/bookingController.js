const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Check if user already has a booking for this tour
  const existingBooking = await Booking.findOne({
    user: req.user.id,
    tour: req.params.tourId,
  });

  if (existingBooking) {
    return res.status(400).json({
      status: 'error',
      message: 'You have already booked this tour',
    });
  }

  // 2) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 3) Create checkout session with updated Stripe v17 format
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    // Use a success URL that points to your frontend
    success_url: `https://tour-web-app-orpin.vercel.app/dashboard?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `https://tour-web-app-orpin.vercel.app/tour/${req.params.tourId}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });

  // 4) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// const createBookingCheckout = async (session) => {
//   const tour = session.client_reference_id;
//   const user = (await User.findOne({ email: session.customer_email })).id;
//   const price = session.display_items[0].amount / 100;
//   await Booking.create({ tour, user, price });
// };

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { tour, user, price } = req.query;

//   if (!tour || !user || !price) return next();
//   await Booking.create({ tour, user, price });

//   res.status(200).json({
//     status: 'success',
//     message: 'Booking created successfully',
//   });
// });

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  // Check if booking already exists
  const existingBooking = await Booking.findOne({ tour, user });
  if (existingBooking) {
    return res.status(200).json({
      status: 'success',
      message: 'Booking already exists',
    });
  }

  await Booking.create({ tour, user, price });

  // Clear URL parameters
  res.redirect('/dashboard');
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // Find all bookings for the current user
  const bookings = await Booking.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name imageCover startDates duration difficulty price',
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  try {
    // Only allow admin and lead-guide to manually set paid status
    const isPaidAllowed = ['admin', 'lead-guide'].includes(req.user.role);

    // For regular users, paid should always be false for manual bookings
    if (!isPaidAllowed && req.body.paid === true) {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can mark bookings as paid',
      });
    }

    // Create the booking
    const newBooking = await Booking.create({
      tour: req.body.tour,
      user: req.body.user,
      price: req.body.price,
      paid: isPaidAllowed ? req.body.paid : false,
    });

    res.status(201).json({
      status: 'success',
      data: {
        data: newBooking,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
});

exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = catchAsync(async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'No booking found with that ID',
      });
    }

    // Only allow admin and lead-guide to update paid status
    const isPaidAllowed = ['admin', 'lead-guide'].includes(req.user.role);

    if (!isPaidAllowed && req.body.paid !== undefined) {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can update payment status',
      });
    }

    // Create update object
    const updateData = {
      tour: req.body.tour || booking.tour,
      user: req.body.user || booking.user,
      price: req.body.price || booking.price,
    };

    // Only include paid status if user is authorized
    if (isPaidAllowed && req.body.paid !== undefined) {
      updateData.paid = req.body.paid;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        data: updatedBooking,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
});

exports.deleteBooking = factory.deleteOne(Booking);

const express = require('express');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const authController = require('../controllers/authController');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// Update database with Cloudinary URLs
router.post('/update-database', 
  authController.protect,
  authController.restrictTo('admin'),
  catchAsync(async (req, res) => {
    console.log('Starting database update...');
    
    // Update tour images
    const tours = await Tour.find({});
    let toursUpdated = 0;
    
    for (const tour of tours) {
      let updated = false;
      
      // Update cover image
      if (tour.imageCover && !tour.imageCover.startsWith('https://res.cloudinary.com')) {
        const newCoverUrl = `https://res.cloudinary.com/dh44xrr1z/image/upload/v1761305940/tours/tours/${tour.imageCover}`;
        tour.imageCover = newCoverUrl;
        updated = true;
      }
      
      // Update tour images
      if (tour.images && tour.images.length > 0) {
        const newImages = tour.images.map((image, index) => {
          if (!image.startsWith('https://res.cloudinary.com')) {
            const version = index === 0 ? 'v1761305934' : index === 1 ? 'v1761305936' : 'v1761305938';
            return `https://res.cloudinary.com/dh44xrr1z/image/upload/${version}/tours/tours/${image}`;
          }
          return image;
        });
        tour.images = newImages;
        updated = true;
      }
      
      if (updated) {
        await tour.save();
        toursUpdated++;
      }
    }
    
    // Update user images
    const users = await User.find({});
    let usersUpdated = 0;
    
    for (const user of users) {
      if (user.photo && !user.photo.startsWith('https://res.cloudinary.com')) {
        user.photo = `https://res.cloudinary.com/dh44xrr1z/image/upload/v1761306056/users/users/${user.photo}`;
        await user.save({ validateBeforeSave: false });
        usersUpdated++;
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Database updated successfully',
      data: {
        toursUpdated,
        usersUpdated
      }
    });
  })
);

module.exports = router;

const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('Connected to database successfully!');
});

// Update tour images
const updateTourImages = async () => {
  console.log('Updating tour images...');

  const tours = await Tour.find({});

  for (const tour of tours) {
    let updated = false;

    // Update cover image
    if (
      tour.imageCover &&
      !tour.imageCover.startsWith('https://res.cloudinary.com')
    ) {
      const newCoverUrl = `https://res.cloudinary.com/dh44xrr1z/image/upload/v1761305940/tours/tours/${tour.imageCover}`;
      tour.imageCover = newCoverUrl;
      updated = true;
    }

    // Update tour images
    if (tour.images && tour.images.length > 0) {
      const newImages = tour.images.map((image, index) => {
        if (!image.startsWith('https://res.cloudinary.com')) {
          const version =
            index === 0
              ? 'v1761305934'
              : index === 1
              ? 'v1761305936'
              : 'v1761305938';
          return `https://res.cloudinary.com/dh44xrr1z/image/upload/${version}/tours/tours/${image}`;
        }
        return image;
      });
      tour.images = newImages;
      updated = true;
    }

    if (updated) {
      await tour.save();
      console.log(`✅ Updated tour: ${tour.name}`);
    }
  }
};

// Update user images
const updateUserImages = async () => {
  console.log('Updating user images...');

  const users = await User.find({});

  for (const user of users) {
    if (user.photo && !user.photo.startsWith('https://res.cloudinary.com')) {
      user.photo = `https://res.cloudinary.com/dh44xrr1z/image/upload/v1761306056/users/users/${user.photo}`;
      await user.save({ validateBeforeSave: false });
      console.log(`✅ Updated user: ${user.name}`);
    }
  }
};

// Run updates
const runUpdates = async () => {
  try {
    await updateTourImages();
    await updateUserImages();
    console.log('✅ Database update completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database update failed:', error);
    process.exit(1);
  }
};

runUpdates();

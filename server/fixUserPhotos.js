const mongoose = require('mongoose');
const User = require('./models/userModel');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

console.log('Connecting to database...');
mongoose.connect(DB).then(() => {
  console.log('Connected to database successfully!');
});

// Fix user photos
const fixUserPhotos = async () => {
  console.log('Fixing user photos...');
  
  const users = await User.find({});
  const defaultPhotoUrl = 'https://res.cloudinary.com/dh44xrr1z/image/upload/v1761306056/users/users/default.jpg';
  
  for (const user of users) {
    let updated = false;
    
    // If photo is default.jpg or doesn't start with https://res.cloudinary.com, update it
    if (user.photo === 'default.jpg' || !user.photo.startsWith('https://res.cloudinary.com')) {
      user.photo = defaultPhotoUrl;
      updated = true;
    }
    
    if (updated) {
      await user.save({ validateBeforeSave: false });
      console.log(`✅ Updated user: ${user.name} - ${user.email}`);
    }
  }
  
  console.log('✅ User photos fix completed!');
};

// Run the fix
const runFix = async () => {
  try {
    await fixUserPhotos();
    process.exit(0);
  } catch (error) {
    console.error('❌ User photos fix failed:', error);
    process.exit(1);
  }
};

runFix();

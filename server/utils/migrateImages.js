const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a single image to Cloudinary
const uploadImageToCloudinary = (imagePath, folder, publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imagePath,
      {
        folder: folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
};

// Migrate tour images
const migrateTourImages = async () => {
  const toursDir = path.join(__dirname, '../public/img/tours');
  const files = fs.readdirSync(toursDir);

  console.log('Starting tour images migration...');

  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const imagePath = path.join(toursDir, file);
      const publicId = `tours/${file.split('.')[0]}`;

      try {
        const url = await uploadImageToCloudinary(imagePath, 'tours', publicId);
        console.log(`✅ Uploaded: ${file} -> ${url}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error.message);
      }
    }
  }
};

// Migrate user images
const migrateUserImages = async () => {
  const usersDir = path.join(__dirname, '../public/img/users');
  const files = fs.readdirSync(usersDir);

  console.log('Starting user images migration...');

  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const imagePath = path.join(usersDir, file);
      const publicId = `users/${file.split('.')[0]}`;

      try {
        const url = await uploadImageToCloudinary(imagePath, 'users', publicId);
        console.log(`✅ Uploaded: ${file} -> ${url}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error.message);
      }
    }
  }
};

// Run migration
const runMigration = async () => {
  try {
    console.log('🚀 Starting image migration to Cloudinary...');

    await migrateTourImages();
    await migrateUserImages();

    console.log('✅ Migration completed!');
    console.log('📝 Note: Update your database with the new Cloudinary URLs');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Export for use in other files
module.exports = {
  uploadImageToCloudinary,
  migrateTourImages,
  migrateUserImages,
  runMigration,
};

// Run if called directly
if (require.main === module) {
  runMigration();
}

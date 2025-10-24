const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
exports.uploadToCloudinary = async (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            reject(
              new Error(`Failed to upload to Cloudinary: ${error.message}`)
            );
          } else {
            resolve(result.secure_url); // Returns the public URL
          }
        }
      )
      .end(buffer);
  });
};

// Delete image from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

// Upload multiple images
exports.uploadMultipleToCloudinary = async (buffers, folder, basePublicId) => {
  const uploadPromises = buffers.map((buffer, index) => {
    const publicId = `${basePublicId}-${index + 1}`;
    return exports.uploadToCloudinary(buffer, folder, publicId);
  });

  return Promise.all(uploadPromises);
};

module.exports = exports;

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file to Cloudinary
const uploadFile = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return result.secure_url; // Return the URL of the uploaded file
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
};

module.exports = { uploadFile };
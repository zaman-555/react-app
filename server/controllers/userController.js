const User = require('../models/User');
const cloudinary = require('../config/cloudinary'); // Adjust path as needed
const multer = require('multer');
const logger = require('../utils/logger');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Get the authenticated user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'profilePicture'], // Include profilePicture
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    logger.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'An error occurred while fetching the profile.' });
  }
};

// Update the authenticated user's profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    logger.error('Error updating profile:', err);
    res.status(500).json({ error: 'An error occurred while updating the profile.' });
  }
};

// Update profile picture
exports.updateProfilePicture = [
  upload.single('profilePicture'), // 'profilePicture' is the field name in the form
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
        folder: 'user-profiles', // Optional: organize uploads in folders
      });

      // Update user's profile picture URL
      user.profilePicture = result.secure_url;
      await user.save();

      res.json({
        message: 'Profile picture updated successfully.',
        profilePicture: result.secure_url,
      });
    } catch (err) {
      logger.error('Error updating profile picture:', err);
      res.status(500).json({ error: 'An error occurred while updating the profile picture.' });
    }
  },
];
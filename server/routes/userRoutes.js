const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');





// Protected routes (authentication required)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/profile/picture', authMiddleware, userController.updateProfilePicture);

module.exports = router;
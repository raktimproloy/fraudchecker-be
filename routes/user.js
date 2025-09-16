const express = require('express');
const UserController = require('../controllers/UserController');
const FraudReportController = require('../controllers/FraudReportController');
const { validate, schemas } = require('../middleware/validation');
const { upload, processImages, cleanupFiles } = require('../middleware/upload');

const router = express.Router();

// Get user profile
router.get('/profile', UserController.getProfile);

// Update user profile
router.put('/profile', UserController.updateProfile);

// User fraud report endpoints
router.post('/reports', validate(schemas.fraudReport), FraudReportController.submitReport);
router.post('/reports/upload', 
  upload.array('images', 5),
  processImages,
  cleanupFiles,
  FraudReportController.uploadImages
);
router.get('/reports', FraudReportController.getUserReports);
router.get('/reports/:id', FraudReportController.getUserReport);
router.delete('/reports/:id', FraudReportController.deleteUserReport);

// Get all users (admin)
router.get('/users', UserController.getAllUsers);

// Update user status (admin)
router.put('/users/:id/status', validate(schemas.userStatusUpdate), UserController.updateUserStatus);

// Get user statistics (admin)
router.get('/stats', UserController.getUserStats);

// Search users (admin)
router.get('/search', UserController.searchUsers);

// Get user activity (admin)
router.get('/activity/:id', UserController.getUserActivity);

// Delete user (admin)
router.delete('/users/:id', UserController.deleteUser);

module.exports = router;
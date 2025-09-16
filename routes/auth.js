const express = require('express');
const AuthController = require('../controllers/AuthController');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Google OAuth callback
router.post('/google', validate(schemas.googleAuth), AuthController.googleAuth);

// Refresh JWT tokens
router.post('/refresh', AuthController.refreshToken);

// User logout
router.post('/logout', AuthController.logout);

// Admin login
router.post('/admin/login', validate(schemas.adminLogin), AuthController.adminLogin);

// Admin logout
router.post('/admin/logout', AuthController.adminLogout);

// Create admin (super admin only)
router.post('/admin/create', AuthController.createAdmin);

// Verify token
router.get('/verify', AuthController.verifyToken);

// Verify admin token
router.get('/admin/verify', AuthController.verifyAdminToken);

module.exports = router;
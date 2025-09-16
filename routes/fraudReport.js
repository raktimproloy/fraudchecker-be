const express = require('express');
const FraudReportController = require('../controllers/FraudReportController');
const { validate, schemas } = require('../middleware/validation');
const { upload, processImages, cleanupFiles } = require('../middleware/upload');

const router = express.Router();


// Get all reports (admin)
router.get('/admin/reports', FraudReportController.getAllReports);

// Get pending reports (admin)
router.get('/admin/reports/pending', FraudReportController.getPendingReports);

// Get specific report (admin)
router.get('/admin/reports/:id', FraudReportController.getReport);

// Update report status (admin)
router.put('/admin/reports/:id/status', validate(schemas.reportStatusUpdate), FraudReportController.updateReportStatus);

// Get dashboard statistics (admin)
router.get('/admin/dashboard', FraudReportController.getDashboardStats);

// Update user report status (user can only update pending/rejected reports)
router.put('/reports/:id/status', validate(schemas.userReportStatusUpdate), FraudReportController.updateUserReportStatus);

module.exports = router;

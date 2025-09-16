const express = require('express');
const PublicController = require('../controllers/PublicController');
const FraudReportController = require('../controllers/FraudReportController');

const router = express.Router();

// Health check
router.get('/health', PublicController.healthCheck);

// Get language content
router.get('/language/:lang', PublicController.getLanguageContent);

// Get available languages
router.get('/languages', PublicController.getAvailableLanguages);

// Get content keys
router.get('/content-keys', PublicController.getContentKeys);

// Get content statistics
router.get('/content-stats', PublicController.getContentStats);

// Public fraud report endpoints
router.get('/search', FraudReportController.searchReports);
router.get('/recent', FraudReportController.getRecentReports);
router.get('/report/:id', FraudReportController.getPublicReport);
router.get('/stats', FraudReportController.getSiteStats);

module.exports = router;
const LanguageContent = require('../models/LanguageContent');

class PublicController {
  // Get language content
  async getLanguageContent(req, res) {
    try {
      const { lang } = req.params;

      // Validate language
      if (!['en', 'bn'].includes(lang.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid language code',
          code: 'INVALID_LANGUAGE',
        });
      }

      const content = await LanguageContent.getLanguageContentObject(lang);

      res.json({
        success: true,
        data: {
          language: lang,
          content,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_LANGUAGE_CONTENT_FAILED',
      });
    }
  }

  // Health check
  async healthCheck(req, res) {
    try {
      res.status(200).json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        code: 'HEALTH_CHECK_FAILED',
      });
    }
  }

  // Get available languages
  async getAvailableLanguages(req, res) {
    try {
      const languages = await LanguageContent.getAvailableLanguages();

      res.json({
        success: true,
        data: languages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_LANGUAGES_FAILED',
      });
    }
  }

  // Get content keys
  async getContentKeys(req, res) {
    try {
      const keys = await LanguageContent.getContentKeys();

      res.json({
        success: true,
        data: keys,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_CONTENT_KEYS_FAILED',
      });
    }
  }

  // Get content statistics
  async getContentStats(req, res) {
    try {
      const stats = await LanguageContent.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_CONTENT_STATS_FAILED',
      });
    }
  }
}

module.exports = new PublicController();

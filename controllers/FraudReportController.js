const FraudReportService = require('../services/FraudReportService');
const FileService = require('../services/FileService');

class FraudReportController {
  // Submit fraud report
  async submitReport(req, res) {
    try {
      const { email, phone, facebook_id, description } = req.body;

      const result = await FraudReportService.submitReport(
        req.user.user_id,
        { email, phone, facebook_id, description }
      );

      res.status(201).json({
        success: true,
        message: 'Fraud report submitted successfully',
        data: result,
      });
    } catch (error) {
      if (error.message === 'You have already reported one or more of these identities') {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'DUPLICATE_REPORT',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'SUBMIT_REPORT_FAILED',
      });
    }
  }

  // Upload images for report
  async uploadImages(req, res) {
    try {
      const { reportId } = req.body;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          error: 'Report ID is required',
          code: 'MISSING_REPORT_ID',
        });
      }

      const images = await FraudReportService.uploadImages(
        req.user.user_id,
        parseInt(reportId),
        req.processedFiles
      );

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          report_id: parseInt(reportId),
          images,
        },
      });
    } catch (error) {
      if (error.message === 'Report not found or access denied') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'REPORT_NOT_FOUND',
        });
      }

      if (error.message === 'Cannot upload images to processed reports') {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'REPORT_PROCESSED',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'UPLOAD_IMAGES_FAILED',
      });
    }
  }

  // Get user's reports
  async getUserReports(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const result = await FraudReportService.getUserReports(req.user.user_id, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_USER_REPORTS_FAILED',
      });
    }
  }

  // Get specific user report
  async getUserReport(req, res) {
    try {
      const { id } = req.params;

      const report = await FraudReportService.getUserReport(
        req.user.user_id,
        parseInt(id)
      );

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'REPORT_NOT_FOUND',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_REPORT_FAILED',
      });
    }
  }

  // Delete user report
  async deleteUserReport(req, res) {
    try {
      const { id } = req.params;

      await FraudReportService.deleteUserReport(req.user.user_id, parseInt(id));

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Report not found or cannot be deleted') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'REPORT_NOT_FOUND',
        });
      }

      if (error.message === 'Cannot delete processed reports') {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'REPORT_PROCESSED',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'DELETE_REPORT_FAILED',
      });
    }
  }

  // Get all reports (admin)
  async getAllReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        identityType,
        dateFrom,
        dateTo,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = req.query;

      const result = await FraudReportService.getAllReports({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        identityType,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_REPORTS_FAILED',
      });
    }
  }

  // Get pending reports (admin)
  async getPendingReports(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await FraudReportService.getPendingReports({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_PENDING_REPORTS_FAILED',
      });
    }
  }

  // Get specific report (admin)
  async getReport(req, res) {
    try {
      const { id } = req.params;

      const report = await FraudReportService.getReport(parseInt(id));

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'REPORT_NOT_FOUND',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_REPORT_FAILED',
      });
    }
  }

  // Update report status (admin)
  async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const updatedReport = await FraudReportService.updateReportStatus(
        parseInt(id),
        status,
        req.admin.admin_id,
        rejectionReason
      );

      res.json({
        success: true,
        message: `Report ${status.toLowerCase()} successfully`,
        data: updatedReport,
      });
    } catch (error) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'REPORT_NOT_FOUND',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'UPDATE_REPORT_STATUS_FAILED',
      });
    }
  }

  // Search reports (public)
  async searchReports(req, res) {
    try {
      const { query, fields } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
          code: 'MISSING_QUERY',
        });
      }

      // Parse search fields from query parameter
      let searchFields = ['email', 'phone', 'facebook_id'];
      if (fields) {
        searchFields = fields.split(',').map(field => field.trim());
      }

      const reports = await FraudReportService.searchReports(query, searchFields);

      res.json({
        success: true,
        data: {
          reports,
          total: reports.length,
          query,
          fields: searchFields,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'SEARCH_REPORTS_FAILED',
      });
    }
  }

  // Get recent reports (public)
  async getRecentReports(req, res) {
    try {
      const { limit = 10 } = req.query;

      const reports = await FraudReportService.getRecentReports(parseInt(limit));

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_RECENT_REPORTS_FAILED',
      });
    }
  }

  // Get public report
  async getPublicReport(req, res) {
    try {
      const { id } = req.params;

      const report = await FraudReportService.getPublicReport(parseInt(id));

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'REPORT_NOT_FOUND',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_PUBLIC_REPORT_FAILED',
      });
    }
  }

  // Get dashboard statistics (admin)
  async getDashboardStats(req, res) {
    try {
      const stats = await FraudReportService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_DASHBOARD_STATS_FAILED',
      });
    }
  }

  // Get site statistics (public)
  async getSiteStats(req, res) {
    try {
      const stats = await FraudReportService.getSiteStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_SITE_STATS_FAILED',
      });
    }
  }

  // Update user report status (user can only update pending/rejected reports)
  async updateUserReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!['PENDING', 'REJECTED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Only PENDING and REJECTED status can be updated by users',
          code: 'INVALID_STATUS_UPDATE',
        });
      }

      const updatedReport = await FraudReportService.updateUserReportStatus(
        req.user.user_id,
        parseInt(id),
        status
      );

      res.json({
        success: true,
        message: 'Report status updated successfully',
        data: updatedReport,
      });
    } catch (error) {
      if (error.message === 'Report not found or access denied') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'REPORT_NOT_FOUND',
        });
      }

      if (error.message === 'Cannot update approved reports') {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'CANNOT_UPDATE_APPROVED',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'UPDATE_REPORT_STATUS_FAILED',
      });
    }
  }
}

module.exports = new FraudReportController();

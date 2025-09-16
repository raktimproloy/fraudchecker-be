const FraudReport = require('../models/FraudReport');
const ReportImage = require('../models/ReportImage');
const User = require('../models/User');

class FraudReportService {
  // Submit fraud report
  async submitReport(userId, reportData) {
    try {
      const { email, phone, facebook_id, description } = reportData;

      // Check if user has already reported any of these identities
      const existingReport = await FraudReport.findDuplicateReport(
        userId,
        email,
        phone,
        facebook_id
      );

      if (existingReport) {
        throw new Error('You have already reported one or more of these identities');
      }

      // Create fraud report
      const report = await FraudReport.create({
        user_id: userId,
        email: email || null,
        phone: phone || null,
        facebook_id: facebook_id || null,
        description,
        status: 'PENDING',
      });

      return {
        report_id: report.report_id,
        status: report.status,
        created_at: report.created_at,
      };
    } catch (error) {
      throw new Error(`Failed to submit report: ${error.message}`);
    }
  }

  // Upload images for report
  async uploadImages(userId, reportId, processedFiles) {
    try {
      // Verify report belongs to user
      const report = await FraudReport.findByIdAndUserId(reportId, userId);
      if (!report) {
        throw new Error('Report not found or access denied');
      }

      if (report.status !== 'PENDING') {
        throw new Error('Cannot upload images to processed reports');
      }

      // Save image records
      const imageRecords = [];
      for (const file of processedFiles) {
        const imageRecord = await ReportImage.create({
          report_id: reportId,
          image_filename: file.filename,
          image_path: file.filepath,
          image_size: file.size,
        });
        imageRecords.push(imageRecord);
      }

      return imageRecords.map(img => ({
        image_id: img.image_id,
        filename: img.image_filename,
        size: img.image_size,
      }));
    } catch (error) {
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  // Get user's reports
  async getUserReports(userId, options = {}) {
    try {
      return await FraudReport.findAll({
        ...options,
        userId,
      });
    } catch (error) {
      throw new Error(`Failed to get user reports: ${error.message}`);
    }
  }

  // Get specific user report
  async getUserReport(userId, reportId) {
    try {
      const report = await FraudReport.findByIdAndUserId(reportId, userId);
      if (!report) {
        throw new Error('Report not found');
      }
      return report;
    } catch (error) {
      throw new Error(`Failed to get report: ${error.message}`);
    }
  }

  // Delete user report
  async deleteUserReport(userId, reportId) {
    try {
      const report = await FraudReport.findByIdAndUserId(reportId, userId);
      if (!report) {
        throw new Error('Report not found or cannot be deleted');
      }

      if (report.status !== 'PENDING') {
        throw new Error('Cannot delete processed reports');
      }

      // Delete associated images from filesystem
      const images = await ReportImage.findByReportId(reportId);
      for (const image of images) {
        // Note: File deletion should be handled by the controller
        // as it requires file system operations
      }

      // Delete report (cascade will handle images in database)
      await FraudReport.delete(reportId);

      return true;
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }

  // Get all reports (admin)
  async getAllReports(options = {}) {
    try {
      return await FraudReport.findAll(options);
    } catch (error) {
      throw new Error(`Failed to get reports: ${error.message}`);
    }
  }

  // Get pending reports (admin)
  async getPendingReports(options = {}) {
    try {
      return await FraudReport.findPending(options);
    } catch (error) {
      throw new Error(`Failed to get pending reports: ${error.message}`);
    }
  }

  // Get specific report (admin)
  async getReport(reportId) {
    try {
      const report = await FraudReport.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }
      return report;
    } catch (error) {
      throw new Error(`Failed to get report: ${error.message}`);
    }
  }

  // Update report status (admin)
  async updateReportStatus(reportId, status, adminId, rejectionReason = null) {
    try {
      const report = await FraudReport.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      return await FraudReport.updateStatus(reportId, status, adminId, rejectionReason);
    } catch (error) {
      throw new Error(`Failed to update report status: ${error.message}`);
    }
  }

  // Search reports (public)
  async searchReports(query, searchFields = ['email', 'phone', 'facebook_id']) {
    try {
      return await FraudReport.search(query, searchFields);
    } catch (error) {
      throw new Error(`Failed to search reports: ${error.message}`);
    }
  }

  // Get recent reports (public)
  async getRecentReports(limit = 10) {
    try {
      return await FraudReport.findRecent(limit);
    } catch (error) {
      throw new Error(`Failed to get recent reports: ${error.message}`);
    }
  }

  // Get public report
  async getPublicReport(reportId) {
    try {
      const report = await FraudReport.findByIdAndStatus(reportId, 'APPROVED');
      if (!report) {
        throw new Error('Report not found');
      }
      return report;
    } catch (error) {
      throw new Error(`Failed to get public report: ${error.message}`);
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalReports,
        pendingReports,
        approvedReports,
        rejectedReports,
        recentReports,
        reportsByType,
        monthlyStats,
      ] = await Promise.all([
        User.count({ status: 'ACTIVE' }),
        FraudReport.count(),
        FraudReport.count({ status: 'PENDING' }),
        FraudReport.count({ status: 'APPROVED' }),
        FraudReport.count({ status: 'REJECTED' }),
        FraudReport.findMany({
          where: { status: 'PENDING' },
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 5,
        }),
        FraudReport.getReportsByType(),
        FraudReport.getMonthlyStats(),
      ]);

      return {
        overview: {
          totalUsers,
          totalReports,
          pendingReports,
          approvedReports,
          rejectedReports,
        },
        recentReports,
        reportsByType: reportsByType.reduce((acc, item) => {
          acc[item.type.toLowerCase()] = item.count;
          return acc;
        }, {}),
        monthlyStats,
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }

  // Get site statistics (public)
  async getSiteStats() {
    try {
      const [
        totalReports,
        reportsByType,
        recentReports,
        totalUsers,
      ] = await Promise.all([
        FraudReport.count({ status: 'APPROVED' }),
        FraudReport.getReportsByType(),
        FraudReport.count({
          status: 'APPROVED',
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        }),
        User.count({ status: 'ACTIVE' }),
      ]);

      return {
        totalReports,
        totalUsers,
        recentReports,
        reportsByType: reportsByType.reduce((acc, item) => {
          acc[item.type.toLowerCase()] = item.count;
          return acc;
        }, {}),
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get site stats: ${error.message}`);
    }
  }

  // Update user report status (user can only update pending/rejected reports)
  async updateUserReportStatus(userId, reportId, status) {
    try {
      // First, get the report to check ownership and current status
      const report = await FraudReport.findByIdAndUserId(reportId, userId);

      if (!report) {
        throw new Error('Report not found or access denied');
      }

      // Check if report can be updated by user
      if (report.status === 'APPROVED') {
        throw new Error('Cannot update approved reports');
      }

      // Update the report status
      const updatedReport = await FraudReport.update(reportId, { status });

      return {
        report_id: updatedReport.report_id,
        status: updatedReport.status,
        updated_at: updatedReport.updated_at,
      };
    } catch (error) {
      throw new Error(`Failed to update report status: ${error.message}`);
    }
  }
}

module.exports = new FraudReportService();

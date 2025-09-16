const database = require('../config/database');

class FraudReport {
  constructor() {
    this.prisma = database.getClient();
  }

  // Create a new fraud report
  async create(reportData) {
    try {
      return await this.prisma.fraudReport.create({
        data: reportData,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to create fraud report: ${error.message}`);
    }
  }

  // Find report by ID
  async findById(reportId) {
    try {
      return await this.prisma.fraudReport.findUnique({
        where: { report_id: reportId },
        include: {
          user: {
            select: {
              user_id: true,
              name: true,
              email: true,
              profile_picture: true,
              created_at: true,
            },
          },
          admin: {
            select: {
              admin_id: true,
              username: true,
            },
          },
          report_images: {
            select: {
              image_id: true,
              image_filename: true,
              image_size: true,
              uploaded_at: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to find fraud report: ${error.message}`);
    }
  }

  // Find report by ID and user ID
  async findByIdAndUserId(reportId, userId) {
    try {
      return await this.prisma.fraudReport.findFirst({
        where: {
          report_id: reportId,
          user_id: userId,
        },
        include: {
          report_images: {
            select: {
              image_id: true,
              image_filename: true,
              image_size: true,
              uploaded_at: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to find fraud report: ${error.message}`);
    }
  }

  // Find report by ID and status
  async findByIdAndStatus(reportId, status) {
    try {
      return await this.prisma.fraudReport.findFirst({
        where: {
          report_id: reportId,
          status: status.toUpperCase(),
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          report_images: {
            select: {
              image_filename: true,
              image_path: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to find fraud report: ${error.message}`);
    }
  }

  // Check if user has already reported any of the provided identities
  async findDuplicateReport(userId, email, phone, facebookId) {
    try {
      const whereConditions = {
        user_id: userId,
        OR: []
      };

      if (email) {
        whereConditions.OR.push({ email: email });
      }
      if (phone) {
        whereConditions.OR.push({ phone: phone });
      }
      if (facebookId) {
        whereConditions.OR.push({ facebook_id: facebookId });
      }

      if (whereConditions.OR.length === 0) {
        return null;
      }

      return await this.prisma.fraudReport.findFirst({
        where: whereConditions,
      });
    } catch (error) {
      throw new Error(`Failed to check duplicate report: ${error.message}`);
    }
  }

  // Update report
  async update(reportId, updateData) {
    try {
      return await this.prisma.fraudReport.update({
        where: { report_id: reportId },
        data: updateData,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          admin: {
            select: {
              username: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to update fraud report: ${error.message}`);
    }
  }

  // Update report status
  async updateStatus(reportId, status, adminId, rejectionReason = null) {
    try {
      const updateData = {
        status,
        approved_by: adminId,
        approved_at: new Date(),
      };

      if (status === 'REJECTED' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      return await this.prisma.fraudReport.update({
        where: { report_id: reportId },
        data: updateData,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          admin: {
            select: {
              username: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to update report status: ${error.message}`);
    }
  }

  // Get all reports with pagination and filters
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        userId,
        dateFrom,
        dateTo,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = options;

      const whereConditions = {};
      
      if (status) {
        whereConditions.status = status.toUpperCase();
      }
      
      if (userId) {
        whereConditions.user_id = userId;
      }
      
      if (dateFrom || dateTo) {
        whereConditions.created_at = {};
        if (dateFrom) {
          whereConditions.created_at.gte = new Date(dateFrom);
        }
        if (dateTo) {
          whereConditions.created_at.lte = new Date(dateTo);
        }
      }

      const [reports, total] = await Promise.all([
        this.prisma.fraudReport.findMany({
          where: whereConditions,
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                email: true,
              },
            },
            admin: {
              select: {
                admin_id: true,
                username: true,
              },
            },
            _count: {
              select: {
                report_images: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
        }),
        this.prisma.fraudReport.count({
          where: whereConditions,
        }),
      ]);

      return {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get fraud reports: ${error.message}`);
    }
  }

  // Get pending reports
  async findPending(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      const [reports, total] = await Promise.all([
        this.prisma.fraudReport.findMany({
          where: { status: 'PENDING' },
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                report_images: true,
              },
            },
          },
          orderBy: {
            created_at: 'asc', // Oldest first
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
        }),
        this.prisma.fraudReport.count({
          where: { status: 'PENDING' },
        }),
      ]);

      return {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get pending reports: ${error.message}`);
    }
  }

  // Search reports
  async search(query, searchFields = ['email', 'phone', 'facebook_id']) {
    try {
      const whereConditions = {
        status: 'APPROVED', // Only show approved reports
        OR: [
          { description: { contains: query } },
        ],
      };

      // Add field-specific searches based on searchFields parameter
      if (searchFields.includes('email')) {
        whereConditions.OR.push({ email: { contains: query } });
      }
      if (searchFields.includes('phone')) {
        whereConditions.OR.push({ phone: { contains: query } });
      }
      if (searchFields.includes('facebook_id')) {
        whereConditions.OR.push({ facebook_id: { contains: query } });
      }

      // Build select object based on search fields
      const selectFields = {
        report_id: true,
        description: true,
        created_at: true,
        report_images: {
          select: {
            image_id: true,
            image_filename: true,
            image_size: true,
            uploaded_at: true,
          },
        },
      };

      // Only include the identity fields that were searched
      if (searchFields.includes('email')) {
        selectFields.email = true;
      }
      if (searchFields.includes('phone')) {
        selectFields.phone = true;
      }
      if (searchFields.includes('facebook_id')) {
        selectFields.facebook_id = true;
      }

      return await this.prisma.fraudReport.findMany({
        where: whereConditions,
        select: selectFields,
        orderBy: {
          created_at: 'desc',
        },
        take: 50, // Limit results
      });
    } catch (error) {
      throw new Error(`Failed to search reports: ${error.message}`);
    }
  }

  // Get recent approved reports
  async findRecent(limit = 10) {
    try {
      return await this.prisma.fraudReport.findMany({
        where: { status: 'APPROVED' },
        select: {
          report_id: true,
          email: true,
          phone: true,
          facebook_id: true,
          description: true,
          created_at: true,
          report_images: {
            select: {
              image_id: true,
              image_filename: true,
              image_size: true,
              uploaded_at: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: parseInt(limit),
      });
    } catch (error) {
      throw new Error(`Failed to get recent reports: ${error.message}`);
    }
  }

  // Count reports
  async count(whereConditions = {}) {
    try {
      return await this.prisma.fraudReport.count({
        where: whereConditions,
      });
    } catch (error) {
      throw new Error(`Failed to count reports: ${error.message}`);
    }
  }

  // Get reports by type (email, phone, facebook)
  async getReportsByType() {
    try {
      const [emailCount, phoneCount, facebookCount] = await Promise.all([
        this.prisma.fraudReport.count({
          where: { 
            status: 'APPROVED',
            email: { not: null }
          }
        }),
        this.prisma.fraudReport.count({
          where: { 
            status: 'APPROVED',
            phone: { not: null }
          }
        }),
        this.prisma.fraudReport.count({
          where: { 
            status: 'APPROVED',
            facebook_id: { not: null }
          }
        })
      ]);

      return [
        { type: 'EMAIL', count: emailCount },
        { type: 'PHONE', count: phoneCount },
        { type: 'FACEBOOK', count: facebookCount }
      ];
    } catch (error) {
      throw new Error(`Failed to get reports by type: ${error.message}`);
    }
  }

  // Get monthly statistics
  async getMonthlyStats(months = 6) {
    try {
      const dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - months);

      return await this.prisma.fraudReport.groupBy({
        by: ['created_at'],
        _count: {
          report_id: true,
        },
        where: {
          created_at: {
            gte: dateFrom,
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to get monthly stats: ${error.message}`);
    }
  }

  // Delete report
  async delete(reportId) {
    try {
      return await this.prisma.fraudReport.delete({
        where: { report_id: reportId },
      });
    } catch (error) {
      throw new Error(`Failed to delete fraud report: ${error.message}`);
    }
  }
}

module.exports = new FraudReport();

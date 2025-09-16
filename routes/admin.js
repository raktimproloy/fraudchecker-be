const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validate, schemas } = require('../middleware/validation');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build where conditions
    const whereConditions = {};
    if (status) {
      whereConditions.status = status.toUpperCase();
    }
    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        select: {
          user_id: true,
          name: true,
          email: true,
          profile_picture: true,
          status: true,
          created_at: true,
          _count: {
            select: {
              fraud_reports: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.user.count({
        where: whereConditions
      })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      details: error.message
    });
  }
});

// Update user status
router.put('/users/:id/status', validate(schemas.userStatusUpdate), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: { status },
      select: {
        user_id: true,
        name: true,
        email: true,
        status: true,
        updated_at: true
      }
    });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      details: error.message
    });
  }
});

// Get all reports with filters
router.get('/reports', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      identityType,
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build where conditions
    const whereConditions = {};
    if (status) {
      whereConditions.status = status.toUpperCase();
    }
    if (identityType) {
      const type = identityType.toUpperCase();
      if (type === 'EMAIL') {
        whereConditions.email = { not: null };
      } else if (type === 'PHONE') {
        whereConditions.phone = { not: null };
      } else if (type === 'FACEBOOK') {
        whereConditions.facebook_id = { not: null };
      }
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

    // Get reports with pagination
    const [reports, total] = await Promise.all([
      prisma.fraudReport.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              user_id: true,
              name: true,
              email: true
            }
          },
          admin: {
            select: {
              admin_id: true,
              username: true
            }
          },
          _count: {
            select: {
              report_images: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.fraudReport.count({
        where: whereConditions
      })
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      error: 'Failed to fetch reports',
      details: error.message
    });
  }
});

// Get pending reports
router.get('/reports/pending', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const [reports, total] = await Promise.all([
      prisma.fraudReport.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              user_id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              report_images: true
            }
          }
        },
        orderBy: {
          created_at: 'asc' // Oldest first
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.fraudReport.count({
        where: { status: 'PENDING' }
      })
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get pending reports error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending reports',
      details: error.message
    });
  }
});

// Update report status
router.put('/reports/:id/status', validate(schemas.reportStatusUpdate), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.admin.admin_id;

    const report = await prisma.fraudReport.findUnique({
      where: { report_id: parseInt(id) }
    });

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    const updateData = {
      status,
      approved_by: adminId,
      approved_at: new Date()
    };

    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const updatedReport = await prisma.fraudReport.update({
      where: { report_id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        admin: {
          select: {
            username: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Report ${status.toLowerCase()} successfully`,
      data: updatedReport
    });

  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      error: 'Failed to update report status',
      details: error.message
    });
  }
});

// Get detailed report view
router.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.fraudReport.findUnique({
      where: { report_id: parseInt(id) },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
            profile_picture: true,
            created_at: true
          }
        },
        admin: {
          select: {
            admin_id: true,
            username: true
          }
        },
        report_images: {
          select: {
            image_id: true,
            image_filename: true,
            image_size: true,
            uploaded_at: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Get report details error:', error);
    res.status(500).json({
      error: 'Failed to fetch report details',
      details: error.message
    });
  }
});

// Get admin dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      recentReports,
      reportsByType,
      monthlyStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.fraudReport.count(),
      prisma.fraudReport.count({ where: { status: 'PENDING' } }),
      prisma.fraudReport.count({ where: { status: 'APPROVED' } }),
      prisma.fraudReport.count({ where: { status: 'REJECTED' } }),
      prisma.fraudReport.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 5
      }),
      // Get reports by type using the new schema
      Promise.all([
        prisma.fraudReport.count({
          where: { 
            status: 'APPROVED',
            email: { not: null }
          }
        }),
        prisma.fraudReport.count({
          where: { 
            status: 'APPROVED',
            phone: { not: null }
          }
        }),
        prisma.fraudReport.count({
          where: { 
            status: 'APPROVED',
            facebook_id: { not: null }
          }
        })
      ]).then(([emailCount, phoneCount, facebookCount]) => [
        { identity_type: 'EMAIL', _count: { report_id: emailCount } },
        { identity_type: 'PHONE', _count: { report_id: phoneCount } },
        { identity_type: 'FACEBOOK', _count: { report_id: facebookCount } }
      ]),
      // Get monthly stats for the last 6 months
      (async () => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyData = await prisma.fraudReport.findMany({
          where: {
            created_at: {
              gte: sixMonthsAgo
            }
          },
          select: {
            created_at: true
          }
        });
        
        // Group by month
        const monthlyStats = monthlyData.reduce((acc, report) => {
          const month = report.created_at.toISOString().substring(0, 7); // YYYY-MM
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});
        
        return Object.entries(monthlyStats).map(([month, count]) => ({
          created_at: new Date(month + '-01'),
          _count: { report_id: count }
        }));
      })()
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalReports,
          pendingReports,
          approvedReports,
          rejectedReports
        },
        recentReports,
        reportsByType: reportsByType.reduce((acc, item) => {
          acc[item.identity_type.toLowerCase()] = item._count.report_id;
          return acc;
        }, {}),
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      details: error.message
    });
  }
});

// Create new admin (super admin only)
router.post('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, role = 'MODERATOR' } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      return res.status(400).json({
        error: 'Admin with this username already exists',
        code: 'ADMIN_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        username,
        password_hash: passwordHash,
        role: role.toUpperCase()
      },
      select: {
        admin_id: true,
        username: true,
        role: true,
        created_at: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      error: 'Failed to create admin',
      details: error.message
    });
  }
});

// Get all admins (super admin only)
router.get('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        admin_id: true,
        username: true,
        role: true,
        last_login: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      error: 'Failed to fetch admins',
      details: error.message
    });
  }
});

module.exports = router;

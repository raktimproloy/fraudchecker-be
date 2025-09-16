const database = require('../config/database');

class User {
  constructor() {
    this.prisma = database.getClient();
  }

  // Create a new user
  async create(userData) {
    try {
      return await this.prisma.user.create({
        data: userData,
        select: {
          user_id: true,
          google_id: true,
          name: true,
          email: true,
          profile_picture: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Find user by ID
  async findById(userId) {
    try {
      return await this.prisma.user.findUnique({
        where: { user_id: userId },
        select: {
          user_id: true,
          google_id: true,
          name: true,
          email: true,
          profile_picture: true,
          status: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              fraud_reports: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  // Find user by email
  async findByEmail(email) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        select: {
          user_id: true,
          google_id: true,
          name: true,
          email: true,
          profile_picture: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  // Find user by Google ID
  async findByGoogleId(googleId) {
    try {
      return await this.prisma.user.findUnique({
        where: { google_id: googleId },
        select: {
          user_id: true,
          google_id: true,
          name: true,
          email: true,
          profile_picture: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find user by Google ID: ${error.message}`);
    }
  }

  // Find user by email or Google ID
  async findByEmailOrGoogleId(email, googleId) {
    try {
      return await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { google_id: googleId },
          ],
        },
        select: {
          user_id: true,
          google_id: true,
          name: true,
          email: true,
          profile_picture: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  // Update user
  async update(userId, updateData) {
    try {
      return await this.prisma.user.update({
        where: { user_id: userId },
        data: updateData,
        select: {
          user_id: true,
          google_id: true,
          name: true,
          email: true,
          profile_picture: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Update user status
  async updateStatus(userId, status) {
    try {
      return await this.prisma.user.update({
        where: { user_id: userId },
        data: { status },
        select: {
          user_id: true,
          name: true,
          email: true,
          status: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }

  // Get all users with pagination and filters
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = options;

      const whereConditions = {};
      
      if (status) {
        whereConditions.status = status.toUpperCase();
      }
      
      if (search) {
        whereConditions.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
        ];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
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
                fraud_reports: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
        }),
        this.prisma.user.count({
          where: whereConditions,
        }),
      ]);

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  // Count users
  async count(whereConditions = {}) {
    try {
      return await this.prisma.user.count({
        where: whereConditions,
      });
    } catch (error) {
      throw new Error(`Failed to count users: ${error.message}`);
    }
  }

  // Delete user
  async delete(userId) {
    try {
      return await this.prisma.user.delete({
        where: { user_id: userId },
      });
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

module.exports = new User();

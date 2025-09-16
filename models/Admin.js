const database = require('../config/database');

class Admin {
  constructor() {
    this.prisma = database.getClient();
  }

  // Create a new admin
  async create(adminData) {
    try {
      return await this.prisma.admin.create({
        data: adminData,
        select: {
          admin_id: true,
          username: true,
          role: true,
          last_login: true,
          created_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  // Find admin by ID
  async findById(adminId) {
    try {
      return await this.prisma.admin.findUnique({
        where: { admin_id: adminId },
        select: {
          admin_id: true,
          username: true,
          role: true,
          last_login: true,
          created_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find admin: ${error.message}`);
    }
  }

  // Find admin by username
  async findByUsername(username) {
    try {
      return await this.prisma.admin.findUnique({
        where: { username },
        select: {
          admin_id: true,
          username: true,
          password_hash: true,
          role: true,
          last_login: true,
          created_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find admin by username: ${error.message}`);
    }
  }

  // Update admin
  async update(adminId, updateData) {
    try {
      return await this.prisma.admin.update({
        where: { admin_id: adminId },
        data: updateData,
        select: {
          admin_id: true,
          username: true,
          role: true,
          last_login: true,
          created_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update admin: ${error.message}`);
    }
  }

  // Update last login
  async updateLastLogin(adminId) {
    try {
      return await this.prisma.admin.update({
        where: { admin_id: adminId },
        data: { last_login: new Date() },
        select: {
          admin_id: true,
          username: true,
          last_login: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  // Get all admins
  async findAll() {
    try {
      return await this.prisma.admin.findMany({
        select: {
          admin_id: true,
          username: true,
          role: true,
          last_login: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to get admins: ${error.message}`);
    }
  }

  // Count admins
  async count() {
    try {
      return await this.prisma.admin.count();
    } catch (error) {
      throw new Error(`Failed to count admins: ${error.message}`);
    }
  }

  // Delete admin
  async delete(adminId) {
    try {
      return await this.prisma.admin.delete({
        where: { admin_id: adminId },
      });
    } catch (error) {
      throw new Error(`Failed to delete admin: ${error.message}`);
    }
  }
}

module.exports = new Admin();

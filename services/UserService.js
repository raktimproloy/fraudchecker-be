const User = require('../models/User');

class UserService {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      const allowedFields = ['name', 'profile_picture'];
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});

      if (Object.keys(filteredData).length === 0) {
        throw new Error('No valid fields to update');
      }

      return await User.update(userId, filteredData);
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  // Get all users (admin)
  async getAllUsers(options = {}) {
    try {
      return await User.findAll(options);
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  // Update user status (admin)
  async updateUserStatus(userId, status) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return await User.updateStatus(userId, status);
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        recentUsers,
      ] = await Promise.all([
        User.count(),
        User.count({ status: 'ACTIVE' }),
        User.count({ status: 'SUSPENDED' }),
        User.findAll({
          page: 1,
          limit: 10,
          sortBy: 'created_at',
          sortOrder: 'desc',
        }),
      ]);

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        recentUsers: recentUsers.users,
      };
    } catch (error) {
      throw new Error(`Failed to get user statistics: ${error.message}`);
    }
  }

  // Search users
  async searchUsers(query, options = {}) {
    try {
      return await User.findAll({
        ...options,
        search: query,
      });
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      return await User.findByEmail(email);
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  // Get user by Google ID
  async getUserByGoogleId(googleId) {
    try {
      return await User.findByGoogleId(googleId);
    } catch (error) {
      throw new Error(`Failed to get user by Google ID: ${error.message}`);
    }
  }

  // Delete user (admin)
  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return await User.delete(userId);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Get user activity
  async getUserActivity(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // This would typically include more detailed activity data
      // For now, we'll return basic user info with report count
      return {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        status: user.status,
        created_at: user.created_at,
        report_count: user._count?.fraud_reports || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get user activity: ${error.message}`);
    }
  }
}

module.exports = new UserService();

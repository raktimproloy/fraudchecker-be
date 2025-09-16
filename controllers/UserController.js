const UserService = require('../services/UserService');

class UserController {
  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await UserService.getUserProfile(req.user.user_id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
        code: 'USER_NOT_FOUND',
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, profilePicture } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (profilePicture) updateData.profile_picture = profilePicture;

      const updatedUser = await UserService.updateUserProfile(
        req.user.user_id,
        updateData
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: 'UPDATE_PROFILE_FAILED',
      });
    }
  }

  // Get all users (admin)
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = req.query;

      const result = await UserService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        search,
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
        code: 'GET_USERS_FAILED',
      });
    }
  }

  // Update user status (admin)
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedUser = await UserService.updateUserStatus(
        parseInt(id),
        status
      );

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'USER_NOT_FOUND',
        });
      }

      res.status(400).json({
        success: false,
        error: error.message,
        code: 'UPDATE_USER_STATUS_FAILED',
      });
    }
  }

  // Get user statistics (admin)
  async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_USER_STATS_FAILED',
      });
    }
  }

  // Search users (admin)
  async searchUsers(req, res) {
    try {
      const { query } = req.query;
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
          code: 'MISSING_QUERY',
        });
      }

      const result = await UserService.searchUsers(query, {
        page: parseInt(page),
        limit: parseInt(limit),
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
        code: 'SEARCH_USERS_FAILED',
      });
    }
  }

  // Get user activity (admin)
  async getUserActivity(req, res) {
    try {
      const { id } = req.params;

      const activity = await UserService.getUserActivity(parseInt(id));

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'USER_NOT_FOUND',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'GET_USER_ACTIVITY_FAILED',
      });
    }
  }

  // Delete user (admin)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      await UserService.deleteUser(parseInt(id));

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'USER_NOT_FOUND',
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        code: 'DELETE_USER_FAILED',
      });
    }
  }
}

module.exports = new UserController();

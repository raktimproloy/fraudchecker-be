const AuthService = require('../services/AuthService');
const { setTokenCookies, clearTokenCookies } = require('../middleware/auth');

class AuthController {
  // Google OAuth login/registration
  async googleAuth(req, res) {
    try {
      const { googleId, name, email, profilePicture } = req.body;

      const result = await AuthService.googleAuth({
        googleId,
        name,
        email,
        profilePicture,
      });

      // Set refresh token cookie
      setTokenCookies(res, result.refreshToken);

      res.json({
        success: true,
        message: 'Authentication successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: 'AUTH_FAILED',
      });
    }
  }

  // Refresh JWT tokens
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required',
          code: 'MISSING_REFRESH_TOKEN',
        });
      }

      const result = await AuthService.refreshToken(refreshToken);

      // Set new refresh token cookie
      setTokenCookies(res, result.refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: result.accessToken,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message,
        code: 'REFRESH_FAILED',
      });
    }
  }

  // User logout
  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;

      await AuthService.logout(refreshToken);

      // Clear cookies
      clearTokenCookies(res);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'LOGOUT_FAILED',
      });
    }
  }

  // Admin login
  async adminLogin(req, res) {
    try {
      const { username, password } = req.body;

      const result = await AuthService.adminLogin(username, password);

      // Set refresh token cookie
      setTokenCookies(res, result.refreshToken);

      res.json({
        success: true,
        message: 'Admin login successful',
        admin: result.admin,
        accessToken: result.accessToken,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message,
        code: 'ADMIN_LOGIN_FAILED',
      });
    }
  }

  // Admin logout
  async adminLogout(req, res) {
    try {
      const { refreshToken } = req.cookies;

      await AuthService.logout(refreshToken);

      // Clear cookies
      clearTokenCookies(res);

      res.json({
        success: true,
        message: 'Admin logged out successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'ADMIN_LOGOUT_FAILED',
      });
    }
  }

  // Create admin (super admin only)
  async createAdmin(req, res) {
    try {
      const { username, password, role = 'MODERATOR' } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required',
          code: 'MISSING_CREDENTIALS',
        });
      }

      const admin = await AuthService.createAdmin({
        username,
        password,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: admin,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: 'CREATE_ADMIN_FAILED',
      });
    }
  }

  // Verify token
  async verifyToken(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          code: 'MISSING_TOKEN',
        });
      }

      const user = await AuthService.verifyAccessToken(token);

      res.json({
        success: true,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message,
        code: 'TOKEN_VERIFICATION_FAILED',
      });
    }
  }

  // Verify admin token
  async verifyAdminToken(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Admin token required',
          code: 'MISSING_ADMIN_TOKEN',
        });
      }

      const admin = await AuthService.verifyAdminToken(token);

      res.json({
        success: true,
        admin: {
          admin_id: admin.admin_id,
          username: admin.username,
          role: admin.role,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message,
        code: 'ADMIN_TOKEN_VERIFICATION_FAILED',
      });
    }
  }
}

module.exports = new AuthController();

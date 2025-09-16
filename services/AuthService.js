const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../models/User');
const Admin = require('../models/Admin');
const RefreshToken = require('../models/RefreshToken');

class AuthService {
  // Generate JWT tokens
  generateTokens(payload) {
    const accessToken = jwt.sign(
      payload,
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessTokenExpiry }
    );
    
    const refreshToken = jwt.sign(
      payload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, config.security.bcryptRounds);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error('Failed to compare password');
    }
  }

  // Google OAuth authentication
  async googleAuth(googleData) {
    try {
      const { googleId, name, email, profilePicture } = googleData;

      // Check if user exists
      let user = await User.findByEmailOrGoogleId(email, googleId);

      if (user) {
        // Update Google ID if missing
        if (!user.google_id) {
          user = await User.update(user.user_id, {
            google_id: googleId,
            profile_picture: profilePicture || user.profile_picture,
          });
        }
      } else {
        // Create new user
        user = await User.create({
          google_id: googleId,
          name,
          email,
          profile_picture: profilePicture,
          status: 'ACTIVE',
        });
      }

      // Check if user is suspended
      if (user.status === 'SUSPENDED') {
        throw new Error('Account suspended');
      }

      // Generate tokens
      const payload = {
        userId: user.user_id,
        email: user.email,
      };
      const { accessToken, refreshToken } = this.generateTokens(payload);

      // Store refresh token
      await RefreshToken.create({
        user_id: user.user_id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return {
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          profile_picture: user.profile_picture,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  // Admin authentication
  async adminLogin(username, password) {
    try {
      // Find admin
      const admin = await Admin.findByUsername(username);
      if (!admin) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, admin.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await Admin.updateLastLogin(admin.admin_id);

      // Generate tokens
      const payload = {
        adminId: admin.admin_id,
        username: admin.username,
        role: admin.role,
      };
      const { accessToken, refreshToken } = this.generateTokens(payload);

      // Store refresh token
      await RefreshToken.create({
        user_id: admin.admin_id, // Using admin_id as user_id for simplicity
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return {
        admin: {
          admin_id: admin.admin_id,
          username: admin.username,
          role: admin.role,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Admin login failed: ${error.message}`);
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken, config.jwt.refreshSecret);
      
      // Check if refresh token exists in database
      const tokenRecord = await RefreshToken.findByToken(refreshToken);
      if (!tokenRecord || tokenRecord.expires_at < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      // Check if user is still active
      if (tokenRecord.user.status !== 'ACTIVE') {
        throw new Error('Account suspended');
      }

      // Generate new tokens
      const payload = {
        userId: tokenRecord.user.user_id,
        email: tokenRecord.user.email,
      };
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(payload);

      // Update refresh token in database
      await RefreshToken.update(refreshToken, {
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // Logout
  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await RefreshToken.delete(refreshToken);
      }
      return true;
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  // Verify access token
  async verifyAccessToken(token) {
    try {
      const decoded = this.verifyToken(token, config.jwt.accessSecret);
      
      // Verify user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.status !== 'ACTIVE') {
        throw new Error('Account suspended');
      }

      return user;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // Verify admin token
  async verifyAdminToken(token) {
    try {
      const decoded = this.verifyToken(token, config.jwt.accessSecret);
      
      const admin = await Admin.findById(decoded.adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      return admin;
    } catch (error) {
      throw new Error(`Admin token verification failed: ${error.message}`);
    }
  }

  // Create admin
  async createAdmin(adminData) {
    try {
      const { username, password, role = 'MODERATOR' } = adminData;

      // Check if admin already exists
      const existingAdmin = await Admin.findByUsername(username);
      if (existingAdmin) {
        throw new Error('Admin with this username already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create admin
      return await Admin.create({
        username,
        password_hash: passwordHash,
        role: role.toUpperCase(),
      });
    } catch (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  // Cleanup expired tokens
  async cleanupExpiredTokens() {
    try {
      return await RefreshToken.deleteExpired();
    } catch (error) {
      throw new Error(`Failed to cleanup expired tokens: ${error.message}`);
    }
  }
}

module.exports = new AuthService();

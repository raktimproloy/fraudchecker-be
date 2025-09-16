const AuthService = require('../services/AuthService');

// Verify JWT access token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const user = await AuthService.verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    if (error.message.includes('Invalid token')) {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.message.includes('Token expired')) {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message.includes('User not found')) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (error.message.includes('Account suspended')) {
      return res.status(403).json({ 
        error: 'Account suspended',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Verify admin token
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Admin token required',
        code: 'MISSING_ADMIN_TOKEN'
      });
    }

    const admin = await AuthService.verifyAdminToken(token);
    req.admin = admin;
    next();
  } catch (error) {
    if (error.message.includes('Invalid token')) {
      return res.status(401).json({ 
        error: 'Invalid admin token',
        code: 'INVALID_ADMIN_TOKEN'
      });
    }
    
    if (error.message.includes('Token expired')) {
      return res.status(401).json({ 
        error: 'Admin token expired',
        code: 'ADMIN_TOKEN_EXPIRED'
      });
    }

    if (error.message.includes('Admin not found')) {
      return res.status(401).json({ 
        error: 'Admin not found',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    console.error('Admin auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Admin authentication failed',
      code: 'ADMIN_AUTH_ERROR'
    });
  }
};

// Check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      error: 'Super admin access required',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }
  next();
};

// Generate JWT tokens
const generateTokens = (payload) => {
  return AuthService.generateTokens(payload);
};

// Set secure cookies
const setTokenCookies = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Clear cookies
const clearTokenCookies = (res) => {
  res.clearCookie('refreshToken');
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  requireSuperAdmin,
  generateTokens,
  setTokenCookies,
  clearTokenCookies
};

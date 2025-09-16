const database = require('../config/database');

class RefreshToken {
  constructor() {
    this.prisma = database.getClient();
  }

  // Create a new refresh token
  async create(tokenData) {
    try {
      return await this.prisma.refreshToken.create({
        data: tokenData,
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to create refresh token: ${error.message}`);
    }
  }

  // Find token by value
  async findByToken(token) {
    try {
      return await this.prisma.refreshToken.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to find refresh token: ${error.message}`);
    }
  }

  // Find token by user ID
  async findByUserId(userId) {
    try {
      return await this.prisma.refreshToken.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              status: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to find refresh tokens: ${error.message}`);
    }
  }

  // Update token
  async update(token, updateData) {
    try {
      return await this.prisma.refreshToken.update({
        where: { token },
        data: updateData,
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to update refresh token: ${error.message}`);
    }
  }

  // Delete token
  async delete(token) {
    try {
      return await this.prisma.refreshToken.delete({
        where: { token },
      });
    } catch (error) {
      throw new Error(`Failed to delete refresh token: ${error.message}`);
    }
  }

  // Delete all tokens for a user
  async deleteByUserId(userId) {
    try {
      return await this.prisma.refreshToken.deleteMany({
        where: { user_id: userId },
      });
    } catch (error) {
      throw new Error(`Failed to delete refresh tokens: ${error.message}`);
    }
  }

  // Delete expired tokens
  async deleteExpired() {
    try {
      return await this.prisma.refreshToken.deleteMany({
        where: {
          expires_at: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete expired tokens: ${error.message}`);
    }
  }

  // Clean up old tokens for a user (keep only the latest 5)
  async cleanupUserTokens(userId, keepCount = 5) {
    try {
      const userTokens = await this.prisma.refreshToken.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      if (userTokens.length > keepCount) {
        const tokensToDelete = userTokens.slice(keepCount);
        const tokenValues = tokensToDelete.map(token => token.token);
        
        return await this.prisma.refreshToken.deleteMany({
          where: {
            token: {
              in: tokenValues,
            },
          },
        });
      }

      return { count: 0 };
    } catch (error) {
      throw new Error(`Failed to cleanup user tokens: ${error.message}`);
    }
  }

  // Count tokens for a user
  async countByUserId(userId) {
    try {
      return await this.prisma.refreshToken.count({
        where: { user_id: userId },
      });
    } catch (error) {
      throw new Error(`Failed to count refresh tokens: ${error.message}`);
    }
  }

  // Get token statistics
  async getStats() {
    try {
      const [totalTokens, activeTokens, expiredTokens] = await Promise.all([
        this.prisma.refreshToken.count(),
        this.prisma.refreshToken.count({
          where: {
            expires_at: {
              gte: new Date(),
            },
          },
        }),
        this.prisma.refreshToken.count({
          where: {
            expires_at: {
              lt: new Date(),
            },
          },
        }),
      ]);

      return {
        totalTokens,
        activeTokens,
        expiredTokens,
      };
    } catch (error) {
      throw new Error(`Failed to get token statistics: ${error.message}`);
    }
  }
}

module.exports = new RefreshToken();

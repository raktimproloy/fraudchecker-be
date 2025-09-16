const database = require('../config/database');

class ReportImage {
  constructor() {
    this.prisma = database.getClient();
  }

  // Create a new report image
  async create(imageData) {
    try {
      return await this.prisma.reportImage.create({
        data: imageData,
        select: {
          image_id: true,
          image_filename: true,
          image_size: true,
          uploaded_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create report image: ${error.message}`);
    }
  }

  // Create multiple images
  async createMany(imagesData) {
    try {
      return await this.prisma.reportImage.createMany({
        data: imagesData,
      });
    } catch (error) {
      throw new Error(`Failed to create report images: ${error.message}`);
    }
  }

  // Find image by ID
  async findById(imageId) {
    try {
      return await this.prisma.reportImage.findUnique({
        where: { image_id: imageId },
        include: {
          fraud_report: {
            select: {
              report_id: true,
              user_id: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to find report image: ${error.message}`);
    }
  }

  // Find images by report ID
  async findByReportId(reportId) {
    try {
      return await this.prisma.reportImage.findMany({
        where: { report_id: reportId },
        select: {
          image_id: true,
          image_filename: true,
          image_size: true,
          uploaded_at: true,
        },
        orderBy: {
          uploaded_at: 'asc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to find report images: ${error.message}`);
    }
  }

  // Find images by report ID and user ID (for user access control)
  async findByReportIdAndUserId(reportId, userId) {
    try {
      return await this.prisma.reportImage.findMany({
        where: {
          report_id: reportId,
          fraud_report: {
            user_id: userId,
          },
        },
        select: {
          image_id: true,
          image_filename: true,
          image_size: true,
          uploaded_at: true,
        },
        orderBy: {
          uploaded_at: 'asc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to find report images: ${error.message}`);
    }
  }

  // Update image
  async update(imageId, updateData) {
    try {
      return await this.prisma.reportImage.update({
        where: { image_id: imageId },
        data: updateData,
        select: {
          image_id: true,
          image_filename: true,
          image_size: true,
          uploaded_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update report image: ${error.message}`);
    }
  }

  // Delete image
  async delete(imageId) {
    try {
      return await this.prisma.reportImage.delete({
        where: { image_id: imageId },
      });
    } catch (error) {
      throw new Error(`Failed to delete report image: ${error.message}`);
    }
  }

  // Delete images by report ID
  async deleteByReportId(reportId) {
    try {
      return await this.prisma.reportImage.deleteMany({
        where: { report_id: reportId },
      });
    } catch (error) {
      throw new Error(`Failed to delete report images: ${error.message}`);
    }
  }

  // Count images by report ID
  async countByReportId(reportId) {
    try {
      return await this.prisma.reportImage.count({
        where: { report_id: reportId },
      });
    } catch (error) {
      throw new Error(`Failed to count report images: ${error.message}`);
    }
  }

  // Get image statistics
  async getStats() {
    try {
      const [totalImages, totalSize, averageSize] = await Promise.all([
        this.prisma.reportImage.count(),
        this.prisma.reportImage.aggregate({
          _sum: {
            image_size: true,
          },
        }),
        this.prisma.reportImage.aggregate({
          _avg: {
            image_size: true,
          },
        }),
      ]);

      return {
        totalImages,
        totalSize: totalSize._sum.image_size || 0,
        averageSize: Math.round(averageSize._avg.image_size || 0),
      };
    } catch (error) {
      throw new Error(`Failed to get image statistics: ${error.message}`);
    }
  }
}

module.exports = new ReportImage();

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const config = require('../config/environment');

class FileService {
  constructor() {
    this.uploadDir = config.upload.uploadPath;
    this.imageDir = path.join(this.uploadDir, 'images');
    this.maxFileSize = config.upload.maxFileSize;
    this.allowedTypes = config.upload.allowedImageTypes;
  }

  // Ensure directories exist
  async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.imageDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directories: ${error.message}`);
    }
  }

  // Validate file
  validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${this.allowedTypes.join(', ')}`);
    }

    return true;
  }

  // Process image with Sharp
  async processImage(file) {
    try {
      // Generate unique filename
      const fileExtension = mime.extension(file.mimetype) || 'jpg';
      const filename = `${uuidv4()}.${fileExtension}`;
      const filepath = path.join(this.imageDir, filename);

      // Process image with Sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Save processed image
      await fs.writeFile(filepath, processedBuffer);

      // Get file stats
      const stats = await fs.stat(filepath);

      return {
        originalname: file.originalname,
        filename: filename,
        filepath: filepath,
        size: stats.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  // Process multiple images
  async processImages(files) {
    try {
      if (!files || files.length === 0) {
        return [];
      }

      if (files.length > config.upload.maxFiles) {
        throw new Error(`Too many files. Maximum ${config.upload.maxFiles} files allowed`);
      }

      // Validate all files
      for (const file of files) {
        this.validateFile(file);
      }

      // Process all files
      const processedFiles = [];
      for (const file of files) {
        const processedFile = await this.processImage(file);
        processedFiles.push(processedFile);
      }

      return processedFiles;
    } catch (error) {
      throw new Error(`Failed to process images: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(filepath) {
    try {
      if (await this.fileExists(filepath)) {
        await fs.unlink(filepath);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Check if file exists
  async fileExists(filepath) {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  // Get file stats
  async getFileStats(filepath) {
    try {
      const stats = await fs.stat(filepath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${error.message}`);
    }
  }

  // Clean up old files
  async cleanupOldFiles(daysOld = 30) {
    try {
      const files = await fs.readdir(this.imageDir);
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(this.imageDir, file);
        const stats = await fs.stat(filepath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filepath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup old files: ${error.message}`);
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const files = await fs.readdir(this.imageDir);
      let totalSize = 0;
      let fileCount = 0;

      for (const file of files) {
        const filepath = path.join(this.imageDir, file);
        const stats = await fs.stat(filepath);
        totalSize += stats.size;
        fileCount++;
      }

      return {
        totalFiles: fileCount,
        totalSize: totalSize,
        averageSize: fileCount > 0 ? Math.round(totalSize / fileCount) : 0,
        directory: this.imageDir,
      };
    } catch (error) {
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }
  }

  // Generate file URL
  generateFileUrl(filename) {
    return `/uploads/images/${filename}`;
  }

  // Get file path from URL
  getFilePathFromUrl(url) {
    const filename = path.basename(url);
    return path.join(this.imageDir, filename);
  }

  // Validate file URL
  async validateFileUrl(url) {
    try {
      const filepath = this.getFilePathFromUrl(url);
      return await this.fileExists(filepath);
    } catch {
      return false;
    }
  }
}

module.exports = new FileService();

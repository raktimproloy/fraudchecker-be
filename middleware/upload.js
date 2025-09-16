const multer = require('multer');
const FileService = require('../services/FileService');
const config = require('../config/environment');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${config.upload.allowedImageTypes.join(', ')} are allowed.`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles
  }
});

// Image processing middleware
const processImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Ensure directories exist
    await FileService.ensureDirectories();

    // Process images using FileService
    const processedFiles = await FileService.processImages(req.files);
    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    return res.status(500).json({
      error: 'Image processing failed',
      details: error.message
    });
  }
};

// Clean up uploaded files on error
const cleanupFiles = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response is an error, clean up files
    if (res.statusCode >= 400 && req.processedFiles) {
      req.processedFiles.forEach(file => {
        FileService.deleteFile(file.filepath).catch(console.error);
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Delete file helper
const deleteFile = async (filepath) => {
  return await FileService.deleteFile(filepath);
};

module.exports = {
  upload,
  processImages,
  cleanupFiles,
  deleteFile
};

const Joi = require('joi');

class Validator {
  // Common validation schemas
  static schemas = {
    // User validation
    user: {
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      profilePicture: Joi.string().uri().optional(),
    },

    // Admin validation
    admin: {
      username: Joi.string().min(3).max(50).required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid('SUPER_ADMIN', 'MODERATOR').optional(),
    },

    // Fraud report validation
    fraudReport: {
      identityType: Joi.string().valid('PHONE', 'EMAIL', 'FACEBOOK').required(),
      identityValue: Joi.string().min(3).max(255).required(),
      description: Joi.string().min(10).max(2000).required(),
    },

    // Report status update validation
    reportStatusUpdate: {
      status: Joi.string().valid('APPROVED', 'REJECTED').required(),
      rejectionReason: Joi.string().max(500).when('status', {
        is: 'REJECTED',
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    },

    // User status update validation
    userStatusUpdate: {
      status: Joi.string().valid('ACTIVE', 'SUSPENDED').required(),
    },

    // Search validation
    search: {
      query: Joi.string().min(2).max(255).required(),
      type: Joi.string().valid('PHONE', 'EMAIL', 'FACEBOOK').optional(),
    },

    // Pagination validation
    pagination: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().valid('created_at', 'updated_at', 'status').default('created_at'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    },

    // Report filters validation
    reportFilters: {
      status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').optional(),
      identityType: Joi.string().valid('PHONE', 'EMAIL', 'FACEBOOK').optional(),
      dateFrom: Joi.date().iso().optional(),
      dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional(),
    },

    // Language content validation
    languageContent: {
      contentKey: Joi.string().min(2).max(100).required(),
      language: Joi.string().valid('EN', 'BN').required(),
      contentValue: Joi.string().min(1).max(5000).required(),
    },

    // ID validation
    id: Joi.number().integer().positive().required(),

    // Email validation
    email: Joi.string().email().required(),

    // Password validation
    password: Joi.string().min(6).required(),

    // Language validation
    language: Joi.string().valid('en', 'bn').required(),
  };

  // Validate request data
  static validate(schema, property = 'body') {
    return (req, res, next) => {
      // Debug logging
      console.log(`Validation middleware called for ${req.method} ${req.path}`);
      console.log(`Validating property: ${property}`);
      console.log(`Data to validate:`, req[property]);
      
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        console.log(`Validation error for ${req.method} ${req.path}:`, error.details);
        
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errorDetails,
        });
      }

      // Replace the original property with validated and sanitized data
      req[property] = value;
      next();
    };
  }

  // Validate ID parameter
  static validateId(req, res, next) {
    const { error, value } = this.schemas.id.validate(req.params.id);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID parameter',
        code: 'INVALID_ID',
      });
    }

    req.params.id = value;
    next();
  }

  // Validate email
  static validateEmail(email) {
    const { error } = this.schemas.email.validate(email);
    return !error;
  }

  // Validate password strength
  static validatePasswordStrength(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }

    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Sanitize input
  static sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  // Validate file upload
  static validateFileUpload(req, res, next) {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
        code: 'NO_FILES',
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 files allowed',
        code: 'TOO_MANY_FILES',
      });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    for (const file of req.files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: `File ${file.originalname} is too large. Maximum size is 5MB`,
          code: 'FILE_TOO_LARGE',
        });
      }

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `File ${file.originalname} has invalid type. Allowed types: ${allowedTypes.join(', ')}`,
          code: 'INVALID_FILE_TYPE',
        });
      }
    }

    next();
  }

  // Validate query parameters
  static validateQuery(schema) {
    return this.validate(schema, 'query');
  }

  // Validate params
  static validateParams(schema) {
    return this.validate(schema, 'params');
  }

  // Custom validation function
  static customValidation(validationFn, errorMessage = 'Validation failed') {
    return (req, res, next) => {
      try {
        const isValid = validationFn(req);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            error: errorMessage,
            code: 'CUSTOM_VALIDATION_ERROR',
          });
        }
        next();
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'CUSTOM_VALIDATION_ERROR',
        });
      }
    };
  }
}

module.exports = Validator;

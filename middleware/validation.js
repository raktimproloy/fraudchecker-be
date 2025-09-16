const Validator = require('../utils/validator');
const Joi = require('joi');

// Validation schemas
const schemas = {
  // User registration/login
  googleAuth: Joi.object({
    googleId: Joi.string().required(),
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    profilePicture: Joi.string().uri().optional()
  }),

  // Admin login
  adminLogin: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required()
  }),

  // Fraud report submission
  fraudReport: Joi.object({
    email: Joi.string().email().allow('', null).optional(),
    phone: Joi.string().min(3).max(20).allow('', null).optional(),
    facebook_id: Joi.string().min(3).max(255).allow('', null).optional(),
    description: Joi.string().min(10).max(2000).required()
  }).custom((value, helpers) => {
    // At least one identity field must be provided and not empty/null
    const hasEmail = value.email && value.email.trim() !== '';
    const hasPhone = value.phone && value.phone.trim() !== '';
    const hasFacebookId = value.facebook_id && value.facebook_id.trim() !== '';
    
    if (!hasEmail && !hasPhone && !hasFacebookId) {
      return helpers.error('custom.atLeastOneIdentity');
    }
    return value;
  }).messages({
    'custom.atLeastOneIdentity': 'At least one identity field (email, phone, or facebook_id) must be provided'
  }),

  // Report status update
  reportStatusUpdate: Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    rejectionReason: Joi.when('status', {
      is: 'REJECTED',
      then: Joi.string().max(500).required(),
      otherwise: Joi.string().max(500).allow(null).optional()
    })
  }),

  // User report status update (only pending and rejected)
  userReportStatusUpdate: Joi.object({
    status: Joi.string().valid('PENDING', 'REJECTED').required()
  }),

  // User status update
  userStatusUpdate: Joi.object({
    status: Joi.string().valid('ACTIVE', 'SUSPENDED').required()
  }),

  // Search parameters
  search: Joi.object({
    query: Joi.string().min(2).max(255).required(),
    fields: Joi.string().pattern(/^(email|phone|facebook_id)(,(email|phone|facebook_id))*$/).optional()
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'status').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Report filters
  reportFilters: Joi.object({
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional()
  }),

  // Language content
  languageContent: Joi.object({
    contentKey: Joi.string().min(2).max(100).required(),
    language: Joi.string().valid('EN', 'BN').required(),
    contentValue: Joi.string().min(1).max(5000).required()
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return Validator.validate(schema, property);
};

// Custom validation functions
const validateFileUpload = Validator.validateFileUpload;

// Sanitize input
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = Validator.sanitizeInput(req.body);
  }

  if (req.query) {
    req.query = Validator.sanitizeInput(req.query);
  }

  next();
};

module.exports = {
  schemas,
  validate,
  validateFileUpload,
  sanitizeInput
};

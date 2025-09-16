class ResponseHelper {
  // Success response
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Error response
  static error(res, message = 'Error', statusCode = 500, code = null, details = null) {
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };

    if (code) {
      response.code = code;
    }

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  // Validation error response
  static validationError(res, errors, message = 'Validation failed') {
    return res.status(400).json({
      success: false,
      error: message,
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Not found response
  static notFound(res, message = 'Resource not found', code = 'NOT_FOUND') {
    return this.error(res, message, 404, code);
  }

  // Unauthorized response
  static unauthorized(res, message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return this.error(res, message, 401, code);
  }

  // Forbidden response
  static forbidden(res, message = 'Forbidden', code = 'FORBIDDEN') {
    return this.error(res, message, 403, code);
  }

  // Conflict response
  static conflict(res, message = 'Conflict', code = 'CONFLICT') {
    return this.error(res, message, 409, code);
  }

  // Too many requests response
  static tooManyRequests(res, message = 'Too many requests', code = 'TOO_MANY_REQUESTS') {
    return this.error(res, message, 429, code);
  }

  // Internal server error response
  static internalError(res, message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return this.error(res, message, 500, code);
  }

  // Bad request response
  static badRequest(res, message = 'Bad request', code = 'BAD_REQUEST') {
    return this.error(res, message, 400, code);
  }

  // Created response
  static created(res, data = null, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  // No content response
  static noContent(res, message = 'No content') {
    return res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Paginated response
  static paginated(res, data, pagination, message = 'Success') {
    return this.success(res, {
      ...data,
      pagination,
    }, message);
  }

  // File response
  static file(res, filePath, filename = null) {
    return res.download(filePath, filename);
  }

  // JSON response
  static json(res, data, statusCode = 200) {
    return res.status(statusCode).json(data);
  }

  // Redirect response
  static redirect(res, url, statusCode = 302) {
    return res.redirect(statusCode, url);
  }

  // Custom response with headers
  static custom(res, data, statusCode = 200, headers = {}) {
    Object.keys(headers).forEach(key => {
      res.set(key, headers[key]);
    });
    return res.status(statusCode).json(data);
  }
}

module.exports = ResponseHelper;

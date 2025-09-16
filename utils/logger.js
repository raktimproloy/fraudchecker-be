const fs = require('fs');
const path = require('path');
const config = require('../config/environment');

class Logger {
  constructor() {
    this.logLevel = config.logging.level || 'info';
    this.logFile = config.logging.file || './logs/app.log';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // Format log message
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
  }

  // Write to log file
  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Check if level should be logged
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  // Log message
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output
    console.log(formattedMessage);
    
    // File output
    this.writeToFile(formattedMessage);
  }

  // Error log
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  // Warning log
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  // Info log
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  // Debug log
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // API request log
  logRequest(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
    };

    if (res.statusCode >= 400) {
      this.error(`${req.method} ${req.originalUrl} - ${res.statusCode}`, meta);
    } else {
      this.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, meta);
    }
  }

  // Database query log
  logQuery(query, params, duration) {
    this.debug('Database Query', {
      query,
      params,
      duration: `${duration}ms`,
    });
  }

  // Error with stack trace
  logError(error, req = null) {
    const meta = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };

    if (req) {
      meta.request = {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
      };
    }

    this.error('Unhandled Error', meta);
  }

  // Security event log
  logSecurity(event, details = {}) {
    this.warn(`Security Event: ${event}`, details);
  }

  // Performance log
  logPerformance(operation, duration, meta = {}) {
    this.info(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...meta,
    });
  }
}

module.exports = new Logger();

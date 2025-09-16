# Fraud Checker Backend - Restructured Architecture

A professional, scalable backend API for the Fraud Checker application built with Express.js, Prisma ORM, and MySQL using modern MVC architecture patterns.

## 🏗️ New Architecture Overview

The backend has been completely restructured to follow professional development practices with clear separation of concerns:

```
backend/
├── config/                 # Configuration files
│   ├── database.js        # Database connection management
│   └── environment.js     # Environment configuration
├── controllers/           # Request handlers (MVC Controllers)
│   ├── AuthController.js
│   ├── UserController.js
│   ├── FraudReportController.js
│   └── PublicController.js
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Global error handling
│   ├── upload.js         # File upload handling
│   └── validation.js     # Input validation
├── models/               # Data access layer (MVC Models)
│   ├── User.js
│   ├── Admin.js
│   ├── FraudReport.js
│   ├── ReportImage.js
│   ├── RefreshToken.js
│   └── LanguageContent.js
├── routes/               # API route definitions
│   ├── auth.js
│   ├── user.js
│   ├── fraudReport.js
│   └── public.js
├── services/             # Business logic layer
│   ├── AuthService.js
│   ├── UserService.js
│   ├── FraudReportService.js
│   └── FileService.js
├── utils/                # Utility functions
│   ├── logger.js         # Logging utility
│   ├── response.js       # Response helpers
│   ├── validator.js      # Validation utilities
│   └── helpers.js        # General helpers
├── prisma/               # Database schema and migrations
│   ├── schema.prisma
│   └── seed.js
├── uploads/              # File upload directory
├── logs/                 # Application logs
├── server.js             # Main server file
├── start.js              # Startup script
└── test-api.js           # API testing script
```

## 🎯 Key Improvements

### 1. **Separation of Concerns**
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and complex operations
- **Models**: Handle database operations and data access
- **Utils**: Reusable utility functions

### 2. **Configuration Management**
- Centralized environment configuration
- Database connection management
- Easy configuration updates

### 3. **Error Handling**
- Centralized error handling
- Consistent error responses
- Proper logging

### 4. **Logging System**
- Structured logging with different levels
- Request/response logging
- Performance monitoring

### 5. **Validation**
- Centralized validation schemas
- Input sanitization
- File upload validation

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
cd backend
npm install
```

### 2. **Environment Setup**
Create a `.env` file:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/fraud_checker"

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-access-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 4. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh JWT tokens
- `POST /api/auth/logout` - User logout
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/logout` - Admin logout
- `POST /api/auth/admin/create` - Create admin (super admin only)

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/language/:lang` - Get language content
- `GET /api/languages` - Get available languages
- `GET /api/content-keys` - Get content keys
- `GET /api/content-stats` - Get content statistics

### User Endpoints (Protected)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/users` - Get all users (admin)
- `PUT /api/user/users/:id/status` - Update user status (admin)
- `GET /api/user/stats` - Get user statistics (admin)
- `GET /api/user/search` - Search users (admin)
- `GET /api/user/activity/:id` - Get user activity (admin)
- `DELETE /api/user/users/:id` - Delete user (admin)

### Fraud Report Endpoints
- `POST /api/fraud/reports` - Submit fraud report
- `POST /api/fraud/reports/upload` - Upload report images
- `GET /api/fraud/reports` - Get user's reports
- `GET /api/fraud/reports/:id` - Get specific report
- `DELETE /api/fraud/reports/:id` - Delete report
- `GET /api/fraud/search` - Search reports (public)
- `GET /api/fraud/recent` - Get recent reports (public)
- `GET /api/fraud/report/:id` - Get public report
- `GET /api/fraud/stats` - Get site statistics (public)

### Admin Endpoints (Protected)
- `GET /api/admin/reports` - Get all reports
- `GET /api/admin/reports/pending` - Get pending reports
- `GET /api/admin/reports/:id` - Get specific report
- `PUT /api/admin/reports/:id/status` - Update report status
- `GET /api/admin/dashboard` - Get dashboard statistics

## 🔧 Configuration

### Environment Variables
All configuration is managed through environment variables in `config/environment.js`:

- **Database**: Connection settings and pooling
- **JWT**: Token secrets and expiration times
- **Google OAuth**: Client credentials
- **File Upload**: Size limits and allowed types
- **Rate Limiting**: Request limits and windows
- **CORS**: Cross-origin settings
- **Security**: Password hashing and session settings

### Database Configuration
Database connection is managed through `config/database.js`:
- Singleton pattern for connection management
- Automatic connection/disconnection
- Query logging in development
- Graceful shutdown handling

## 🛠️ Development

### Project Structure Benefits

1. **Maintainability**: Clear separation makes code easy to maintain
2. **Scalability**: Easy to add new features and endpoints
3. **Testability**: Each layer can be tested independently
4. **Reusability**: Services and utilities can be reused
5. **Debugging**: Clear flow makes debugging easier

### Adding New Features

1. **Model**: Add database operations in `models/`
2. **Service**: Add business logic in `services/`
3. **Controller**: Add request handling in `controllers/`
4. **Routes**: Add API endpoints in `routes/`
5. **Validation**: Add validation schemas in `utils/validator.js`

### Logging

The application uses a structured logging system:
- **Error logs**: Application errors and exceptions
- **Info logs**: General information and status updates
- **Debug logs**: Detailed debugging information
- **Request logs**: HTTP request/response logging

### Error Handling

Centralized error handling with:
- Consistent error response format
- Proper HTTP status codes
- Error logging
- Development vs production error details

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**: Set all production values
2. **Database**: Configure production database
3. **Security**: Use strong JWT secrets
4. **Logging**: Configure log file rotation
5. **Monitoring**: Set up application monitoring
6. **SSL**: Configure HTTPS certificates

### Docker Support

The application is ready for containerization:
- Environment-based configuration
- Graceful shutdown handling
- Health check endpoints
- Log file management

## 📊 Monitoring

### Health Checks
- `GET /api/health` - Application health status
- Database connection status
- Memory usage and uptime

### Logging
- Request/response logging
- Error tracking
- Performance monitoring
- Security event logging

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation
- **File Security**: Image type and size validation
- **CORS Protection**: Secure cross-origin requests
- **Password Hashing**: bcrypt for secure storage
- **SQL Injection Protection**: Prisma ORM protection

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed initial data
- `npm test` - Run API tests

## 🤝 Contributing

1. Follow the established architecture patterns
2. Add proper error handling and logging
3. Include validation for all inputs
4. Write tests for new features
5. Update documentation

## 📄 License

This project is licensed under the ISC License.

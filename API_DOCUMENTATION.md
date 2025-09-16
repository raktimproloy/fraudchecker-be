# Fraud Checker API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Endpoints

### Authentication Endpoints

#### POST /auth/google
Google OAuth login/registration

**Request Body:**
```json
{
  "googleId": "string",
  "name": "string",
  "email": "string",
  "profilePicture": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profile_picture": "https://..."
  },
  "accessToken": "jwt-token"
}
```

#### POST /auth/refresh
Refresh access token using refresh token from cookies

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "new-jwt-token"
}
```

#### POST /auth/logout
Logout user and invalidate refresh token

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /auth/admin/login
Admin login

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "admin": {
    "admin_id": 1,
    "username": "admin",
    "role": "SUPER_ADMIN"
  },
  "accessToken": "jwt-token"
}
```

### Public Endpoints

#### GET /search
Search fraud records

**Query Parameters:**
- `query` (required): Search term
- `type` (optional): Identity type (PHONE, EMAIL, FACEBOOK)

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "report_id": 1,
        "identity_type": "PHONE",
        "identity_value": "+1234567890",
        "description": "Fraud description",
        "created_at": "2024-01-01T00:00:00.000Z",
        "user": {
          "name": "Reporter Name"
        }
      }
    ],
    "total": 1,
    "query": "search term",
    "type": "PHONE"
  }
}
```

#### GET /stats
Get site statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReports": 100,
    "totalUsers": 50,
    "recentReports": 10,
    "reportsByType": {
      "phone": 60,
      "email": 30,
      "facebook": 10
    },
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /language/:lang
Get language content

**Path Parameters:**
- `lang`: Language code (en, bn)

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "en",
    "content": {
      "site_title": "Fraud Checker",
      "site_description": "Check for fraud...",
      "search_placeholder": "Enter phone number..."
    }
  }
}
```

### Protected User Endpoints

#### GET /user/profile
Get user profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profile_picture": "https://...",
    "status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00.000Z",
    "_count": {
      "fraud_reports": 5
    }
  }
}
```

#### POST /user/reports
Submit fraud report

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "identityType": "PHONE",
  "identityValue": "+1234567890",
  "description": "Detailed description of the fraud"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fraud report submitted successfully",
  "data": {
    "report_id": 1,
    "status": "PENDING",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /user/reports/upload
Upload images for report

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `reportId`: Report ID
- `images`: Image files (max 5, max 5MB each)

**Response:**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "report_id": 1,
    "images": [
      {
        "image_id": 1,
        "filename": "image1.jpg",
        "size": 1024000
      }
    ]
  }
}
```

#### GET /user/reports
Get user's reports

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED)

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "report_id": 1,
        "identity_type": "PHONE",
        "identity_value": "+1234567890",
        "description": "Fraud description",
        "status": "PENDING",
        "created_at": "2024-01-01T00:00:00.000Z",
        "_count": {
          "report_images": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Admin Endpoints

#### GET /admin/dashboard
Get admin dashboard statistics

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 100,
      "totalReports": 200,
      "pendingReports": 10,
      "approvedReports": 150,
      "rejectedReports": 40
    },
    "recentReports": [...],
    "reportsByType": {
      "phone": 120,
      "email": 60,
      "facebook": 20
    },
    "monthlyStats": [...]
  }
}
```

#### GET /admin/users
Get all users with pagination

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `search` (optional): Search by name or email
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order (asc, desc)

#### PUT /admin/users/:id/status
Update user status

**Headers:** `Authorization: Bearer <admin-token>`

**Path Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "status": "SUSPENDED"
}
```

#### GET /admin/reports
Get all reports with filters

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `identityType`: Filter by identity type
- `dateFrom`, `dateTo`: Date range filter

#### PUT /admin/reports/:id/status
Update report status

**Headers:** `Authorization: Bearer <admin-token>`

**Path Parameters:**
- `id`: Report ID

**Request Body:**
```json
{
  "status": "APPROVED",
  "rejectionReason": "Reason for rejection (if status is REJECTED)"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `MISSING_TOKEN` | Access token required |
| `INVALID_TOKEN` | Invalid or malformed token |
| `TOKEN_EXPIRED` | Token has expired |
| `USER_NOT_FOUND` | User not found |
| `ACCOUNT_SUSPENDED` | User account is suspended |
| `DUPLICATE_REPORT` | Report already exists |
| `REPORT_NOT_FOUND` | Report not found |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | Invalid file type uploaded |
| `VALIDATION_FAILED` | Request validation failed |

## Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: Rate limit info included in response headers

## File Upload

- **Max file size**: 5MB per file
- **Max files**: 5 per request
- **Allowed types**: image/jpeg, image/png, image/webp
- **Processing**: Images are automatically resized and optimized

## Database Schema

### Users Table
- `user_id` (PRIMARY KEY)
- `google_id` (UNIQUE)
- `name`
- `email` (UNIQUE)
- `profile_picture`
- `status` (ACTIVE, SUSPENDED)
- `created_at`
- `updated_at`

### Fraud Reports Table
- `report_id` (PRIMARY KEY)
- `user_id` (FOREIGN KEY)
- `identity_type` (PHONE, EMAIL, FACEBOOK)
- `identity_value`
- `description`
- `status` (PENDING, APPROVED, REJECTED)
- `rejection_reason`
- `created_at`
- `approved_at`
- `approved_by` (FOREIGN KEY to Admins)

### Report Images Table
- `image_id` (PRIMARY KEY)
- `report_id` (FOREIGN KEY)
- `image_filename`
- `image_path`
- `image_size`
- `uploaded_at`

### Admin Users Table
- `admin_id` (PRIMARY KEY)
- `username` (UNIQUE)
- `password_hash`
- `role` (SUPER_ADMIN, MODERATOR)
- `last_login`
- `created_at`

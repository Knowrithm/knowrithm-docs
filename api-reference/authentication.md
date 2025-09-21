# Authentication API 🔐

This guide covers all endpoints related to user authentication, user management, and API key management.

---

## 🎯 Authentication Methods

The Knowrithm API supports two primary methods of authentication for different use cases.

### 1. API Key & Secret (Recommended for Service-to-Service)

This is the preferred method for programmatic access via the SDK or direct API calls from your backend.

**Headers:**
```http
X-API-Key: your-api-key
X-API-Secret: your-api-secret
```

### 2. JWT Bearer Token (For User-Context Actions)

JWTs are used for authenticating users in a web or mobile application context, typically for actions performed through a user interface like the Knowrithm dashboard.

**Header:**
```http
Authorization: Bearer <your-jwt-token>
```

---

## 🔑 API Key Management

These endpoints allow you to programmatically manage your API keys.

### Create API Key

`POST /auth/api-keys`

Creates a new API key with a specified name and permissions.

**Request Body:**
```json
{
  "name": "Analytics Read-Only Key",
  "permissions": {
    "read": true,
    "write": false
  },
  "expires_in_days": 90
}
```

### List API Keys

`GET /auth/api-keys`

Retrieves a list of all API keys associated with the current user.

### Revoke API Key

`DELETE /auth/api-keys/{api_key_id}`

Permanently revokes an API key, disabling its access.

### Validate Credentials

`GET /auth/validate`

Validates the current API Key and Secret, returning information about the associated user and company. This is a great way to test your credentials.

**Success Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": { "id": "user_123", "email": "test@example.com" },
    "company": { "id": "company_456", "name": "Acme Corp" }
  }
}
```

---

## 👥 User & Session Management

These endpoints are for managing user accounts and sessions, typically used by a client application like the Knowrithm dashboard.

### User Registration

`POST /auth/register`

Registers a new user account.

### User Login

`POST /auth/login`

Authenticates a user with email and password, returning a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "ey...",
    "refresh_token": "ey..."
  }
}
```

### Refresh Token

`POST /auth/refresh`

Uses a refresh token to generate a new access token.

### User Logout

`POST /auth/logout`

Invalidates the user's current session tokens.

---

## 👤 User Profile Management

### Get User Profile

`GET /user/profile`

Retrieves the profile information for the currently authenticated user.

### Update User Profile

`PUT /user/profile`

Updates the profile information for the currently authenticated user.
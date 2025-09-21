# Knowrithm API Reference 🔌

Welcome to the Knowrithm REST API documentation. Our API provides direct access to all platform features, enabling you to build custom integrations, mobile applications, and enterprise solutions.

---

## 🎯 API Overview

The Knowrithm API is a RESTful service that provides:

- **🔐 Secure Authentication** - JWT-based security with API keys
- **📊 Comprehensive Endpoints** - Full platform functionality access
- **⚡ High Performance** - Optimized for production workloads
- **🌍 Global Availability** - CDN-powered for low-latency worldwide access
- **📈 Rate Limited** - Fair usage policies with generous limits

{{ hint style="info" }}
**Base URL**: `https://app.knowrithm.org/api/v1`

**Current Version**: v1 (Latest)
{{ endhint }}

---

## 🚀 Quick Start

### 1. Get Your API Credentials

To get your API credentials, log in to your Knowrithm dashboard, navigate to **Settings > API Keys**, and generate a new key.

### 2. Make Your First Request

You can use your `X-API-Key` and `X-API-Secret` to authenticate your requests.

#### List Agents

```bash
curl -X GET "https://app.knowrithm.org/api/v1/agent" \
  -H "X-API-Key: your-api-key" \
  -H "X-API-Secret: your-api-secret" \
  -H "Content-Type: application/json"
```

### 3. Create an AI Agent

```bash
curl -X POST "https://app.knowrithm.org/api/v1/agent" \
  -H "X-API-Key: your-api-key" \
  -H "X-API-Secret: your-api-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Bot",
    "description": "Helpful customer service assistant",
    "personality": "friendly and professional"
  }'
```

---

## 🔐 Authentication

The Knowrithm API uses multiple authentication methods:

### API Key Authentication (Recommended)

```http
X-API-Key: your-api-key
X-API-Secret: your-api-secret
```

### JWT Token Authentication

```http
Authorization: Bearer <jwt-token>
```

### Basic Authentication (Admin Only)

```http
Authorization: Basic <base64-encoded-credentials>
```

{{ hint style="warning" }}
**Security Best Practices:**
- Never expose API keys in client-side code
- Use HTTPS for all requests
- Implement proper key rotation
- Monitor API usage for anomalies
{{ endhint }}

---

## 📋 Core Endpoints

### 🏢 Company Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/company` | Create new company |
| `GET` | `/company` | List companies |
| `GET` | `/company/{id}` | Get company details |
| `PUT` | `/company/{id}` | Update company |
| `DELETE` | `/company/{id}` | Delete company |
| `GET` | `/company/{id}/statistics` | Get company metrics |

### 🤖 Agent Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/agent` | Create AI agent |
| `GET` | `/agent` | List company agents |
| `GET` | `/agent/{id}` | Get agent details |
| `PUT` | `/agent/{id}` | Update agent |
| `DELETE` | `/agent/{id}` | Delete agent |
| `PATCH` | `/agent/{id}/restore` | Restore deleted agent |

### 💬 Conversation Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/conversation` | Start new conversation |
| `GET` | `/conversation` | List conversations |
| `GET` | `/conversation/{id}/messages` | Get conversation history |
| `POST` | `/conversation/{id}/chat` | Send message to agent |
| `DELETE` | `/conversation/{id}` | Delete conversation |

### 📚 Document Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/document/upload` | Upload document |
| `GET` | `/document` | List documents |
| `POST` | `/search/document` | Search within documents |
| `DELETE` | `/document/{id}` | Delete document |
| `PATCH` | `/document/{id}/restore` | Restore document |

### 👥 Lead Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/lead/register` | Lead self-registration |
| `POST` | `/lead` | Create lead (admin) |
| `GET` | `/lead/{id}` | Get lead details |
| `PUT` | `/lead/{id}` | Update lead |
| `GET` | `/lead/company` | Get company leads |

### 🗄️ Database Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/database-connection` | Add database connection |
| `GET` | `/database-connection` | List connections |
| `POST` | `/database-connection/{id}/test` | Test connection |
| `POST` | `/search/database` | Search across databases |
| `DELETE` | `/database-connection/{id}` | Delete connection |

### 📊 Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytic/dashboard` | Get dashboard metrics |
| `GET` | `/overview` | Get analytics overview |
| `GET` | `/usage-trends` | Get usage trends |
| `GET` | `/api-key-performance` | Get API performance |

---

## 📊 Response Format

All API responses follow a consistent JSON structure:

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "agent_123",
    "name": "Customer Support Bot",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Agent created successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "name": ["Name is required"],
      "email": ["Invalid email format"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Pagination

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 🎯 Request Examples

### Creating an Agent

```http
POST /api/v1/agent
X-API-Key: your-api-key
X-API-Secret: your-api-secret
Content-Type: application/json

{
  "name": "Sales Assistant",
  "description": "AI assistant for sales inquiries",
  "personality": "enthusiastic and persuasive",
  "model_name": "gpt-4",
  "max_response_length": 300,
  "temperature": 0.7,
  "response_config": {
    "tone": "professional",
    "include_sources": true,
    "fallback_message": "Let me connect you with a human agent."
  }
}
```

### Uploading a Document

```http
POST /api/v1/document/upload
X-API-Key: your-api-key
X-API-Secret: your-api-secret
Content-Type: multipart/form-data

{
  "file": "@/path/to/document.pdf",
  "agent_id": "agent_123",
  "document_type": "faq",
  "metadata": {
    "category": "product_info",
    "version": "1.0"
  }
}
```

### Starting a Conversation

```http
POST /api/v1/conversation
X-API-Key: your-api-key
X-API-Secret: your-api-secret
Content-Type: application/json

{
  "agent_id": "agent_123",
  "entity_type": "USER",
  "metadata": {
    "source": "website",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1"
  }
}
```

### Sending a Message

```http
POST /api/v1/conversation/conv_456/chat
X-API-Key: your-api-key
X-API-Secret: your-api-secret
Content-Type: application/json

{
  "content": "I need help with my recent order",
  "role": "user",
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "channel": "web_chat"
  }
}
```

---

## 🔄 Rate Limiting

The API implements rate limiting to ensure fair usage:

| Tier | Rate Limit | Burst Limit |
|------|------------|-------------|
| **Free** | 100 req/hour | 10 req/minute |
| **Pro** | 1,000 req/hour | 50 req/minute |
| **Enterprise** | 10,000 req/hour | 200 req/minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 850
X-RateLimit-Reset: 1640995200
Retry-After: 3600
```

### Handling Rate Limits

```javascript
async function makeAPIRequest(endpoint, options) {
  const response = await fetch(endpoint, options);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeAPIRequest(endpoint, options); // Retry
  }
  
  return response;
}
```

---

## 📝 Data Models

### Agent Model

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "personality": "string",
  "model_name": "string",
  "temperature": "number (0-1)",
  "max_response_length": "integer",
  "status": "enum [active, inactive, training]",
  "company_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "response_config": {
    "tone": "string",
    "include_sources": "boolean",
    "fallback_message": "string"
  }
}
```

### Conversation Model

```json
{
  "id": "string",
  "agent_id": "string", 
  "entity_type": "enum [USER, LEAD]",
  "status": "enum [active, ended, archived]",
  "lead_id": "string",
  "message_count": "integer",
  "started_at": "datetime",
  "ended_at": "datetime",
  "rating": "integer (1-5)",
  "metadata": "object"
}
```

### Document Model

```json
{
  "id": "string",
  "filename": "string",
  "file_size": "integer",
  "file_type": "string",
  "agent_id": "string",
  "status": "enum [processing, completed, failed]",
  "processing_progress": "integer (0-100)",
  "chunk_count": "integer",
  "uploaded_at": "datetime",
  "processed_at": "datetime",
  "metadata": "object"
}
```

### Lead Model

```json
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "company_name": "string",
  "source": "string",
  "status": "enum [new, contacted, qualified, converted]",
  "company_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "notes": "string"
}
```

---

## 🔍 Search and Filtering

### Query Parameters

Most list endpoints support these query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Items per page (max: 100) |
| `search` | string | Search term |
| `status` | string | Filter by status |
| `created_after` | datetime | Filter by creation date |
| `created_before` | datetime | Filter by creation date |
| `sort_by` | string | Sort field |
| `sort_order` | enum | `asc` or `desc` |

### Example: List Agents with Filters

```http
GET /api/v1/agent?page=1&per_page=20&status=active&search=support&sort_by=created_at&sort_order=desc
X-API-Key: your-api-key
X-API-Secret: your-api-secret
```

---

## 🔧 Webhooks

Set up webhooks to receive real-time notifications:

### Webhook Events

| Event | Description |
|-------|-------------|
| `agent.created` | New agent created |
| `conversation.started` | Conversation initiated |
| `conversation.ended` | Conversation completed |
| `message.received` | New message from user |
| `message.sent` | Response sent by agent |
| `lead.created` | New lead registered |
| `lead.updated` | Lead status changed |
| `document.processed` | Document processing complete |

### Webhook Payload

```json
{
  "event": "conversation.started",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "conversation_id": "conv_456",
    "agent_id": "agent_123",
    "lead_id": "lead_789"
  },
  "signature": "sha256=abcdef123456..."
}
```

### Webhook Verification

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(
        f"sha256={expected_signature}",
        signature
    )
```

---

## 🚨 Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing credentials |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 📚 SDK and Libraries

### Official SDKs

- **Python**: `pip install knowrithm-py` ([Documentation](../python-sdk/))
- **JavaScript/Node.js**: `npm install knowrithm-js` (Coming Soon)
- **Go**: `go get github.com/knowrithm/knowrithm-go` (Coming Soon)
- **PHP**: `composer require knowrithm/knowrithm-php` (Coming Soon)

### Community Libraries

- **Ruby**: `gem install knowrithm-ruby`
- **Java**: Maven/Gradle support available
- **C#/.NET**: NuGet package available

---

## 🔧 Testing

### Test Endpoints

Use these endpoints for development and testing:

```bash
# Health check
curl https://app.knowrithm.org/health

# API status
curl https://app.knowrithm.org/api/v1/status

# Validate credentials
curl -X GET "https://app.knowrithm.org/api/v1/auth/validate" \
  -H "X-API-Key: your-api-key" \
  -H "X-API-Secret: your-api-secret"
```

### Postman Collection

Download our official Postman collection for easy API testing:

{{ hint style="info" }}
**Postman Collection**: [Download here](https://api.knowrithm.org/postman/collection.json)

**Environment Template**: [Download here](https://api.knowrithm.org/postman/environment.json)
{{ endhint }}

### cURL Examples Collection

```bash
# Set your credentials
export API_KEY="your-api-key"
export API_SECRET="your-api-secret"
export BASE_URL="https://app.knowrithm.org/api/v1"

# Create an agent
curl -X POST "$BASE_URL/agent" \
  -H "X-API-Key: $API_KEY" \
  -H "X-API-Secret: $API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "description": "Testing agent creation",
    "personality": "helpful"
  }'

# List agents
curl -X GET "$BASE_URL/agent" \
  -H "X-API-Key: $API_KEY" \
  -H "X-API-Secret: $API_SECRET"

# Start conversation
curl -X POST "$BASE_URL/conversation" \
  -H "X-API-Key: $API_KEY" \
  -H "X-API-Secret: $API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_123",
    "entity_type": "USER"
  }'
```

---

## 🌐 Environments

### Production Environment
- **Base URL**: `https://app.knowrithm.org/api/v1`
- **Rate Limits**: Full production limits
- **SLA**: 99.9% uptime guarantee
- **Support**: 24/7 enterprise support

### Staging Environment
- **Base URL**: `https://staging.knowrithm.org/api/v1`
- **Rate Limits**: Relaxed for testing
- **SLA**: Best effort
- **Support**: Business hours only

### Development Environment
- **Base URL**: `https://dev.knowrithm.org/api/v1`
- **Rate Limits**: Very relaxed
- **SLA**: No guarantee
- **Support**: Community support only

---

## 📊 Performance Optimization

### Request Optimization

```bash
# Use compression
curl -H "Accept-Encoding: gzip" \
     -H "X-API-Key: $API_KEY" \
     "https://app.knowrithm.org/api/v1/agent"

# Batch requests when possible
curl -X POST "https://app.knowrithm.org/api/v1/agents/batch" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agents": [
      {"name": "Agent 1", "personality": "helpful"},
      {"name": "Agent 2", "personality": "professional"}
    ]
  }'
```

### Caching Strategies

```javascript
// Client-side caching example
class KnowrithmAPIClient {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.cache = new Map();
  }

  async getAgent(agentId) {
    const cacheKey = `agent_${agentId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes
        return cached.data;
      }
    }

    const response = await this.makeRequest(`/agent/${agentId}`);
    this.cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    return response;
  }
}
```

### Pagination Best Practices

```python
# Efficient pagination handling
async def get_all_agents():
    page = 1
    all_agents = []
    
    while True:
        response = await api_client.get(
            "/agent",
            params={"page": page, "per_page": 100}
        )
        
        agents = response["data"]
        all_agents.extend(agents)
        
        if not response["pagination"]["has_next"]:
            break
            
        page += 1
    
    return all_agents
```

---

## 🔐 Security Best Practices

### API Key Security

```python
# ✅ Good: Environment variables
import os
api_key = os.getenv('KNOWRITHM_API_KEY')

# ❌ Bad: Hardcoded in source
api_key = "ka_1234567890abcdef"  # Never do this!
```

### Request Signing

```python
import hmac
import hashlib
import time

def sign_request(method, path, body, secret):
    timestamp = str(int(time.time()))
    message = f"{method}\n{path}\n{body}\n{timestamp}"
    
    signature = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return {
        'X-Signature': signature,
        'X-Timestamp': timestamp
    }
```

### Input Validation

```javascript
// Validate input before sending to API
function validateAgentData(agentData) {
  const errors = [];
  
  if (!agentData.name || agentData.name.length < 1) {
    errors.push('Name is required');
  }
  
  if (agentData.name && agentData.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  if (agentData.temperature && (agentData.temperature < 0 || agentData.temperature > 1)) {
    errors.push('Temperature must be between 0 and 1');
  }
  
  return errors;
}
```

---

## 🔄 API Versioning

### Version Strategy

The Knowrithm API uses URL path versioning:

- **Current Version**: `/api/v1`
- **Next Version**: `/api/v2` (Beta)

### Backward Compatibility

```bash
# Version 1 (Current)
curl "https://app.knowrithm.org/api/v1/agent"

# Version 2 (Beta) - New features
curl "https://app.knowrithm.org/api/v2/agent"
```

### Migration Guide

When migrating between versions:

1. Test thoroughly in staging environment
2. Update SDK to compatible version
3. Monitor error rates during transition
4. Keep fallback to previous version ready

---

## 📈 Analytics and Monitoring

### API Usage Analytics

```bash
# Get API key performance
curl -X GET "https://app.knowrithm.org/api/v1/api-key-performance" \
  -H "X-API-Key: $API_KEY" \
  -H "X-API-Secret: $API_SECRET"
```

Response:
```json
{
  "success": true,
  "data": {
    "total_requests": 15420,
    "successful_requests": 14987,
    "failed_requests": 433,
    "avg_response_time": 245,
    "requests_per_day": 1285,
    "top_endpoints": [
      {
        "endpoint": "/conversation/{id}/chat",
        "count": 8432,
        "avg_response_time": 312
      }
    ]
  }
}
```

### Error Analysis

```bash
# Get error breakdown
curl -X GET "https://app.knowrithm.org/api/v1/error-analysis" \
  -H "X-API-Key: $API_KEY" \
  -H "X-API-Secret: $API_SECRET"
```

---

## 🚀 Advanced Features

### Streaming Responses

For real-time chat applications:

```javascript
const response = await fetch('/api/v1/conversation/123/chat', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'X-API-Secret': apiSecret,
    'Content-Type': 'application/json',
    'Accept': 'text/stream'
  },
  body: JSON.stringify({
    content: 'Hello!',
    role: 'user',
    stream: true
  })
});

const reader = response.body.getReader();
let fullResponse = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = new TextDecoder().decode(value);
  const lines = chunk.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.content) {
        fullResponse += data.content;
        // Update UI with streaming content
        updateChatMessage(data.content);
      }
    }
  }
}
```

### Bulk Operations

```bash
# Bulk create agents
curl -X POST "https://app.knowrithm.org/api/v1/agent/bulk" \
  -H "X-API-Key: $API_KEY" \
  -H "X-API-Secret: $API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "agents": [
      {
        "name": "Sales Bot",
        "personality": "persuasive",
        "template": "sales_template"
      },
      {
        "name": "Support Bot", 
        "personality": "helpful",
        "template": "support_template"
      }
    ]
  }'

# Bulk upload documents
curl -X POST "https://app.knowrithm.org/api/v1/document/bulk-upload" \
  -H "X-API-Key: $API_KEY" \
  -H "X-API-Secret: $API_SECRET" \
  -F "files[]=@document1.pdf" \
  -F "files[]=@document2.pdf" \
  -F "agent_id=agent_123"
```

---

## 📚 Integration Examples

### Website Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>Knowrithm Chat Widget</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Knowrithm Chat Widget -->
    <script>
        (function() {
            const script = document.createElement('script');
            script.src = 'https://app.knowrithm.org/api/widget.js';
            script.setAttribute('data-agent-id', 'agent_123');
            script.setAttribute('data-company-id', 'company_456');
            script.setAttribute('data-api-url', 'https://app.knowrithm.org/api');
            script.setAttribute('data-theme', 'modern');
            script.async = true;
            document.head.appendChild(script);
        })();
    </script>
</body>
</html>
```

### Mobile App Integration

```swift
// iOS Swift example
import Foundation

class KnowrithmAPI {
    private let apiKey: String
    private let apiSecret: String
    private let baseURL = "https://app.knowrithm.org/api/v1"
    
    init(apiKey: String, apiSecret: String) {
        self.apiKey = apiKey
        self.apiSecret = apiSecret
    }
    
    func sendMessage(conversationId: String, content: String, completion: @escaping (Result<ChatResponse, Error>) -> Void) {
        var request = URLRequest(url: URL(string: "\(baseURL)/conversation/\(conversationId)/chat")!)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "X-API-Key")
        request.setValue(apiSecret, forHTTPHeaderField: "X-API-Secret")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["content": content, "role": "user"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            // Handle response
        }.resume()
    }
}
```

---

## 📋 API Endpoints Summary

For detailed documentation of each endpoint, visit the specific sections:

- **[Authentication](authentication.md)** - Login, API keys, token management
- **[Companies](companies.md)** - Company CRUD operations and statistics  
- **[Agents](agents.md)** - AI agent creation and management
- **[Conversations](conversations.md)** - Chat sessions and messaging
- **[Documents](documents.md)** - File upload and processing
- **[Databases](databases.md)** - External database connections
- **[Analytics](analytics.md)** - Metrics, reporting, and insights

---

## 🤝 Community and Support

### Getting Help

1. **Documentation**: Start here for comprehensive guides
2. **API Status**: Check [status.knowrithm.org](https://status.knowrithm.org) for service status
3. **Discord Community**: Join developers discussing integrations
4. **GitHub Issues**: Report bugs and request features
5. **Email Support**: Direct support for enterprise customers

### Contributing

We welcome API feedback and contributions:

- **Feature Requests**: Submit via GitHub issues
- **Bug Reports**: Include API request/response details
- **Documentation**: Help improve our guides
- **SDKs**: Contribute to community libraries

---

## 📚 Additional Resources

- **[OpenAPI Specification](https://app.knowrithm.org/api/openapi.json)** - Machine-readable API spec
- **[Postman Collection](https://api.knowrithm.org/postman/collection.json)** - Ready-to-use API tests
- **[SDK Documentation](../python-sdk/)** - High-level SDK guides
- **[Tutorial Examples](../tutorials/)** - Real-world implementation examples
- **[Changelog](../resources/changelog.md)** - API updates and changes

---

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; color: white; text-align: center; margin: 32px 0;">

**Ready to start building?**

[Explore Authentication](authentication.md) • [View Examples](../tutorials/) • [Join Discord](https://discord.gg/cHHWfghJrR)

</div>
# Security Guide 🔒

This guide provides a comprehensive overview of the security features, architecture, and best practices for deploying and managing the Knowrithm platform securely.

---

## 🎯 Security Philosophy

Security is a core principle at Knowrithm. Our platform is designed with a multi-layered, defense-in-depth strategy to protect your data and ensure the integrity of your AI agents.

- **Data Isolation**: A multi-tenant architecture ensures that your company's data is completely segregated from others.
- **Encryption Everywhere**: Data is encrypted both in transit (TLS) and at rest.
- **Principle of Least Privilege**: Granular permissions for both users and API keys.
- **Proactive Monitoring**: Continuous security monitoring and logging to detect and respond to threats.

---

## 🏛️ Security Architecture

Our security model is built on multiple layers of protection.

```mermaid
graph TD
    subgraph "Network Layer"
        WAF[Web Application Firewall]
        LB[Load Balancer with DDoS Protection]
        CDN[Content Delivery Network]
    end
    
    subgraph "Application Layer"
        AUTH[JWT Authentication & API Keys]
        RBAC[Role-Based Access Control]
        RATE[Rate Limiting]
        VALID[Input Validation & Sanitization]
    end
    
    subgraph "Data Layer"
        ENCRYPT[Encryption at Rest (AES-256)]
        TLS[Encryption in Transit (TLS 1.2+)]
        BACKUP[Encrypted Backups]
        AUDIT[Audit Logging]
    end
    
    subgraph "Infrastructure Layer"
        VPC[Virtual Private Cloud]
        SECRETS[Secrets Management (e.g., Vault, AWS KMS)]
        MONITOR[Security Monitoring & Alerting]
        COMPLIANCE[Compliance Controls (GDPR, HIPAA)]
    end
```

---

## 🔐 Authentication & Authorization

Secure access to the platform is managed through a robust authentication and authorization system.

### Authentication Methods
- **JWT Tokens**: For user sessions in the web dashboard, providing stateless, secure authentication.
- **API Key & Secret**: The primary method for programmatic access via the SDK and REST API.

### Role-Based Access Control (RBAC)

Knowrithm uses a granular RBAC model to enforce the principle of least privilege.

| Role | Description | Key Permissions |
|---|---|---|
| **Super Admin** | Manages the entire platform instance. | Create companies, view system-wide metrics. |
| **Company Admin** | Manages a single company account. | Create agents, manage users, view company analytics. |
| **User** | A standard user within a company. | Interact with assigned agents, view own conversations. |
| **Lead** | An external user interacting with an agent. | Can only interact within their own conversation session. |

### Code Example: Permission Decorator

The following snippet from our platform's backend shows how we enforce permissions on API endpoints.

```python
# From platform-guide/README.md
from functools import wraps

class SecurityManager:
    # ... (verify_token method) ...

    def require_permission(self, permission: str):
        """Decorator to require specific permissions for an endpoint."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                token = request.headers.get('Authorization', '').replace('Bearer ', '')
                
                try:
                    payload = self.verify_token(token)
                    # Check if the required permission is in the token's scope
                    if permission not in payload.get('permissions', []):
                        raise SecurityError("Insufficient permissions")
                    
                    request.user_id = payload['user_id']
                    return func(*args, **kwargs)
                    
                except SecurityError as e:
                    return {'error': str(e)}, 403 # Forbidden
                    
            return wrapper
        return decorator

# Usage in a Flask route
# @app.route('/api/v1/agent', methods=['POST'])
# @security.require_permission('agents:write')
# def create_agent():
#     # This code only runs if the user has the 'agents:write' permission
#     ...
```

---

## 🛡️ Data Protection

Protecting your data is our top priority.

### Encryption at Rest

All sensitive data stored in our databases and object storage is encrypted using the **AES-256** standard. This includes:
- User and lead personal information (PII).
- Agent configurations and system prompts.
- Uploaded documents and their processed chunks.
- Database connection credentials.

Our `EncryptionManager` class demonstrates how we apply field-level encryption for sensitive database columns.

{% content-ref url="README.md" %}
Data Encryption Code Example
{% endcontent-ref %}

### Encryption in Transit

All communication between your client (browser, SDK) and the Knowrithm API is encrypted using **TLS 1.2 or higher**. We enforce HTTPS on all endpoints to prevent eavesdropping and man-in-the-middle attacks.

### Secure Document Storage

Uploaded documents are stored in a secure, private object storage bucket (like AWS S3) with:
- Server-side encryption enabled.
- Access restricted to authorized internal services only.
- Regular security audits and access logging.

---

## 🌐 Network Security

- **VPC**: The entire platform runs within a Virtual Private Cloud (VPC), isolating it from public networks.
- **WAF**: A Web Application Firewall (WAF) protects against common web exploits like SQL injection and Cross-Site Scripting (XSS).
- **DDoS Protection**: Our infrastructure includes DDoS mitigation services to ensure platform availability.
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse and ensure fair usage.

---

## 📋 Compliance & Auditing

- **Audit Logs**: All significant actions taken by users and agents are logged for security and compliance auditing. This includes logins, agent creation, data deletion, and more.
- **GDPR & CCPA**: The platform provides tools for data export and deletion to help you comply with data privacy regulations like GDPR and CCPA.
- **HIPAA**: For healthcare customers, we offer a HIPAA-compliant environment with additional security controls and a Business Associate Agreement (BAA).

---

## ✨ Security Best Practices for Users

To maximize the security of your Knowrithm account, we recommend the following:

1.  **Use Strong, Unique Passwords**: For your Knowrithm dashboard account.
2.  **Enable Multi-Factor Authentication (MFA)**: Add an extra layer of security to your login.
3.  **Rotate API Keys Regularly**: Create a policy to rotate your API keys every 90 days.
4.  **Principle of Least Privilege**: When creating an API key, grant it only the permissions it absolutely needs. For example, a key used for a public-facing widget should only have permission to start conversations, not delete agents.
5.  **Secure Your Webhooks**: When using webhooks, always validate the incoming request signature using your webhook secret to ensure the request is from Knowrithm.

    ```python
    import hmac
    import hashlib

    def verify_webhook(payload, signature, secret):
        """Verify a webhook signature to ensure it's authentic."""
        expected_signature = hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Use hmac.compare_digest for secure, constant-time comparison
        return hmac.compare_digest(
            f"sha256={expected_signature}",
            signature
        )
    ```

6.  **Use Secrets Management Tools**: Store your API keys and other secrets in a secure vault like AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault, not in your source code.

---

## Next Steps

- **Review Deployment Guide**: Learn how to deploy the platform securely.
  {% content-ref url="deployment.md" %}
- **Set Up Monitoring**: Configure monitoring and alerting for security events.
  {% content-ref url="monitoring.md" %}
- **API Authentication**: Dive deeper into API key management.
  {% content-ref url="../api-reference/authentication.md" %}
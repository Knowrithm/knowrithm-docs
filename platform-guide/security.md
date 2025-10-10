# Security Guide

Follow these practices to secure Knowrithm deployments across authentication, data protection, infrastructure, and compliance.

---

## Core Principles

- **Tenant isolation**: every record is scoped by `company_id` and enforced in service layers.
- **Encryption**: TLS 1.2+ in transit; AES-256 at rest (databases, object storage, backups).
- **Least privilege**: scoped API keys, JWT roles, and granular admin endpoints.
- **Auditability**: append-only logs for login, configuration, ingestion, and deletion events.

---

## Authentication and Access Control

| Mechanism | Purpose |
|-----------|---------|
| API keys (`X-API-Key`, `X-API-Secret`) | Service-to-service access; scoped permissions (`read`, `write`, `admin`) |
| JWT tokens | User sessions for dashboard and delegated operations |
| RBAC | Super admin, company admin, user, lead roles with route-level checks |
| MFA (dashboard) | Recommended for administrators |

Rotate API keys every 90 days, revoke keys for decommissioned services, and store credentials in a secret manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).

---

## Data Protection

- **Documents**: stored in private object storage buckets with server-side encryption and signed URL access.
- **Database credentials**: encrypted using Fernet/ KMS before persistence.
- **Backups**: encrypted at rest, retained per policy, and tested with restore drills.
- **Webhooks**: sign payloads with HMAC (`X-Knowrithm-Signature`) and verify on receipt.

Before exporting sensitive data, ensure your compliance policies permit it and scrub PII where required.

---

## Network and Infrastructure

- Deploy within a VPC or equivalent private network.
- Use HTTPS termination (ACME/Let's Encrypt, AWS ACM, etc.).
- Apply WAF and DDoS protection at the load balancer edge.
- Enforce rate limits per endpoint and per credential.
- Enable network policies or security groups to restrict database and Redis access to application pods.

Environment variables containing secrets should never be checked into source control; mount them via secret stores or orchestrator-specific secret objects.

---

## Compliance and Logging

- Generate audit logs for authentication events, CRUD operations, exports, and webhook deliveries.
- Maintain logs for the retention period mandated by your policies (GDPR, CCPA, HIPAA).
- Provide data portability via `/v1/analytic/export` and `/v1/document` endpoints; respect deletion requests by wiping soft-deleted records on schedule.
- Support BAA for HIPAA deployments by isolating workloads, hardening logging paths, and disabling test datasets in production.

---

## Secure Development Practices

- Validate and sanitize all payloads (`pydantic`/schema validation).
- Keep dependencies up to date; run vulnerability scans on container images.
- Use automated tests to cover permission boundaries and data isolation.
- Run static analysis (Bandit, Semgrep) as part of CI/CD.
- Require code review for changes touching auth, encryption, or database access.

---

## Incident Response

1. Identify via monitoring (alerts, anomaly detection).
2. Triage scope using audit logs and request IDs.
3. Contain by revoking credentials or scaling down affected workloads.
4. Remediate underlying cause and issue patches.
5. Notify stakeholders when required by compliance obligations.

Maintain runbooks for common incidents (credential compromise, ingestion backlog, provider outage).

---

## Next Steps

- Harden your deployment (see [deployment.md](deployment.md)).
- Configure observability and alerting (see [monitoring.md](monitoring.md)).
- Review authentication flows for clients and integrations (see [../api-reference/authentication.md](../api-reference/authentication.md)).








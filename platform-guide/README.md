# Platform Guide

This guide describes the architecture, deployment patterns, and operational best practices for running the Knowrithm enterprise multi-agent chatbot platform in production environments.

---

## Platform Overview

Knowrithm is a multi-tenant system built on Flask, Celery, PostgreSQL, Redis, and modern AI services. It enables companies to provision isolated AI agents, train them on proprietary data, manage conversations at scale, and observe performance through detailed analytics.

Key characteristics:
- Horizontal scalability for conversation and ingestion workloads
- Strict tenant isolation across companies, agents, and data stores
- Hybrid data ingestion (documents, databases, web, OCR)
- Extensible LLM configuration with provider management

---

## Architecture

### Logical Components

```
Clients (Web, SDK, Widget)
        |
Knowrithm API (Flask + REST)
        |
Services: Authentication, Agent Management, Conversation Engine,
          Document Processor, Database Connector, Analytics
        |
Data Stores: PostgreSQL, Redis, Object Storage, Vector DB
        |
AI Layer: LLM providers, Embedding models, OCR
```

### Multi-Tenant Isolation

```
Company A                         Company B
|- Agents                        |- Agents
|- Documents                     |- Documents
|- Database Connections          |- Database Connections
`- Leads                         `- Leads

Shared Services: Authentication, Analytics, AI Providers
Isolation: Company IDs scoped in every service and data model
```

### Data Flow

1. Companies upload documents or register databases.
2. Celery workers process data, extract content, and generate embeddings.
3. Agents consume embeddings and metadata to answer questions.
4. Conversations, leads, and analytics are recorded in PostgreSQL.
5. Dashboards aggregate metrics for admins and super admins.

---

## Deployment Options

### 1. Knowrithm SaaS
- Fully managed infrastructure
- Automatic scaling, backups, and monitoring
- Recommended for teams that prefer zero-ops

### 2. Self-Hosted Docker Compose

```bash
git clone <repository-url>
cd enterprise-chatbot-platform

cp .env.example .env   # configure all secrets
docker-compose up -d
docker-compose exec app flask db upgrade

curl http://localhost:8543/health
```

Services:
- `app`: Flask API + background scheduler
- `celery-worker`: asynchronous processing
- `db`: PostgreSQL
- `redis`: caching + Celery broker
- `nginx`: optional reverse proxy and TLS termination

### 3. Kubernetes

Run the platform on Kubernetes for autoscaling and resilience:

- Separate Deployments for API, workers, scheduler, and ingestion jobs
- StatefulSets for PostgreSQL and Redis (or use managed equivalents)
- HorizontalPodAutoscaler targeting CPU and memory for API pods
- PodDisruptionBudgets to maintain availability during upgrades
- ConfigMaps and Secrets for environment configuration
- Persistent volumes for uploads, logs, and backups

---

## Configuration and Secrets

### Required Environment Variables

```env
SECRET_KEY=...
JWT_SECRET_KEY=...
SQLALCHEMY_DATABASE_URI=postgresql://user:pass@db:5432/knowrithm
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
UPLOAD_FOLDER=/app/uploads
MAX_FILE_SIZE=52428800
BASE_URL=https://app.knowrithm.org

# Email and notifications
SMTP_SERVER=...
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
RESEND_API_KEY=...

# AI provider configuration
GEMINI_API_KEY=...
ENCRYPTION_KEY=FERNET_KEY

# Super admin bootstrap
SUPER_ADMIN_EMAIL=...
SUPER_ADMIN_USERNAME=...
SUPER_ADMIN_FIRST_NAME=...
SUPER_ADMIN_LAST_NAME=...
SUPER_ADMIN_PASSWORD=...
```

Store secrets in a vault (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault) or Kubernetes Secrets. Never commit plain-text credentials.

### Database Examples

```
postgresql://user:pass@hostname:5432/database
mysql://user:pass@hostname:3306/database
sqlite:///absolute/path/to/database.db
mongodb://user:pass@hostname:27017/database
```

---

## Scaling Strategies

### API Layer
- Use gunicorn or uWSGI behind Nginx.
- Configure connection pooling with SQLAlchemy.
- Auto-scale pods based on CPU, memory, and request latency.

### Background Processing
- Celery workers handle ingestion, OCR, embedding, analytics, and notification jobs.
- Scale worker replicas independently of the API.
- Use Redis or RabbitMQ as the broker; ensure persistence for long-running queues.

### Storage
- PostgreSQL: enable connection pooling (pgBouncer) and tune indexes.
- Redis: monitor memory usage, use snapshots or AOF for persistence if needed.
- Object storage: host document uploads on S3-compatible storage.
- Vector search: integrate with managed services or self-hosted vector databases.

### Performance Benchmarks

| Metric                    | Target    | Notes                               |
|---------------------------|-----------|-------------------------------------|
| API response time         | < 200 ms  | Cache metadata and authorize early  |
| Agent response latency    | < 2 s     | Depends on LLM provider             |
| Document processing       | < 5 min   | Parallelize ingestion workers       |
| Concurrent conversations  | 10,000+   | Scale API and worker pools          |
| Platform uptime           | 99.9%     | Implement redundancy and failover   |

---

## Security and Compliance

### Authentication
- JWT access tokens with short lifetimes
- API keys with scope-based permissions
- Support for impersonation workflows (super admins)

### Data Protection
- Encrypt secrets using Fernet or a KMS
- TLS termination at load balancer or Nginx
- Sanitize uploads and inputs (server-side validation)
- Isolate company data via database schema constraints

### Audit and Governance
- Audit log events for authentication, configuration, and data access
- Retention policies configurable per tenant
- Support for data export and deletion (GDPR readiness)

---

## Monitoring and Observability

### Metrics
- Application: request rate, latency, error counts
- Workers: queue depth, task duration, success/failure counts
- Database: connection usage, slow queries, replication lag
- Business: conversation volume, lead conversion, agent quality

### Tooling
- Prometheus + Grafana dashboards
- ELK/Opensearch stack or Loki for logs
- Alertmanager or PagerDuty for incident notifications
- Health probes (`/health`) for load balancers and uptime checks

### Logging Guidelines
- `INFO`: user actions, job lifecycle events
- `WARNING`: slow responses, near-threshold resource use
- `ERROR`: failed requests, exceptions, service outages
- `DEBUG`: development diagnostics (disable in production)

---

## Backup and Disaster Recovery

- Nightly PostgreSQL backups with point-in-time recovery
- Redis snapshotting for session and queue resilience
- Object storage versioning for uploaded documents
- Infrastructure-as-code definitions (Terraform, Helm) stored in source control
- Run quarterly recovery drills to verify RTO/RPO objectives

---

## Runbooks

| Scenario                       | Resolution Outline                                                     |
|--------------------------------|-------------------------------------------------------------------------|
| API latency spikes             | Inspect Redis, database health, and LLM provider status. Scale API.    |
| Stuck document ingestion       | Check Celery queue, retry failed tasks, inspect worker logs.           |
| Failed database connection     | Validate credentials, rotate secrets, rerun `test_connection`.         |
| Elevated error rates           | Review audit logs, roll back recent deploys, enable debug tracing.     |
| Incident escalation            | Notify on-call, post in incident channel, follow incident checklist.   |

---

## Compliance Checklist

- [ ] TLS enforced for all external traffic
- [ ] Secrets rotated and stored securely
- [ ] Access logs retained per compliance requirements
- [ ] Data export and deletion workflows validated
- [ ] Employee access reviewed quarterly

---

## Helpful Links

- [Root README](../README.md)
- [Python SDK Reference](../python-sdk/README.md)
- [API Reference](../api-reference/README.md)
- [Security Guidelines](security.md)
- [Deployment Recipes](deployment.md)
- [Monitoring Playbooks](monitoring.md)

For support, contact `support@knowrithm.org` or visit the community Discord.







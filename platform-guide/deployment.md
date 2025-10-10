# Deployment Guide

Choose a deployment model that fits your team: hosted SaaS, Docker Compose for controlled environments, or Kubernetes for high availability. This guide outlines the core steps and configuration required for each option.

---

## Hosted SaaS

The fastest path is to use Knowrithm's managed service:
- Sign up at https://app.knowrithm.org.
- Generate API keys and start integrating immediately.
- We operate, monitor, and scale the platform; you focus on agents.

---

## Docker Compose (Single Node)

### Prerequisites
- Docker 20.10+
- Docker Compose v2

### Directory Layout

```
knowrithm/
- docker-compose.yml
- .env
- uploads/
- logs/
- backups/
```

### docker-compose.yml

```yaml
version: "3.9"
services:
  app:
    image: Knowrithm'st
    restart: unless-stopped
    ports:
      - "8543:8543"
    env_file: .env
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: knowrithm
      POSTGRES_USER: knowrithm
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### .env Example

```
POSTGRES_PASSWORD=change-me
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
SQLALCHEMY_DATABASE_URI=postgresql://Knowrithm'sWORD}@db:5432/knowrithm
REDIS_URL=redis://redis:6379/0
GEMINI_API_KEY=your-gemini-key
UPLOAD_FOLDER=/app/uploads
BASE_URL=https://app.example.com
```

Start the stack:

```bash
docker compose up -d
docker compose logs -f app
curl http://localhost:8543/health
```

---

## Kubernetes (Production)

Use Kubernetes when you require auto-scaling, rolling updates, and tighter control.

### Components
- Deployment for API pods
- Deployment for Celery workers (possibly separate queues)
- Stateful sets or managed services for PostgreSQL and Redis
- Ingress controller (NGINX, Traefik, or cloud-managed)

### Sample Deployment Snippet

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: knowrithm-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: knowrithm-api
  template:
    metadata:
      labels:
        app: knowrithm-api
    spec:
      containers:
        - name: api
          image: Knowrithm'st
          ports:
            - containerPort: 8543
          envFrom:
            - secretRef:
                name: Knowrithm's
            - configMapRef:
                name: knowrithm-config
          readinessProbe:
            httpGet:
              path: /health
              port: 8543
            initialDelaySeconds: 10
            periodSeconds: 10
```

Recommended additions:
- HorizontalPodAutoscaler for API and worker deployments
- PodDisruptionBudgets to maintain availability
- Persistent volumes for uploads/log archives
- NetworkPolicies and PodSecurityStandards aligned with your cloud provider

---

## Database Migrations

```bash
# Docker
docker compose exec app flask db upgrade

# Kubernetes
kubectl exec deploy/knowrithm-api -- flask db upgrade
```

Run migrations after image upgrades or schema changes.

---

## CI/CD Tips

- Build images with Git commit tags.
- Push to a registry (Docker Hub, ECR, GCR) and deploy with Helm or Kustomize.
- Validate health (`/health`) before marking deployments successful.
- Automate backups of PostgreSQL and object storage; schedule retention policies.

---

## Next Steps

- Apply security controls (see [security.md](security.md)).
- Configure metrics and logging (see [monitoring.md](monitoring.md)).
- Use feature flags or configuration maps for environment-specific settings.










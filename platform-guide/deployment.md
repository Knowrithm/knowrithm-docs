# Deployment Guide 🚀

This guide provides comprehensive instructions for deploying the Knowrithm platform in various environments, from local development with Docker to scalable production clusters with Kubernetes.

---

## 🎯 Deployment Options

Knowrithm offers flexible deployment options to suit your infrastructure needs.

| Option | Best For | Complexity | Control |
|---|---|---|---|
| **SaaS (Hosted)** | Teams wanting a fully managed, zero-maintenance solution. | Easiest | Low |
| **Docker Compose** | Local development, testing, and small-scale deployments. | Medium | Medium |
| **Kubernetes** | Production environments requiring high availability and auto-scaling. | High | High |

---

## ☁️ SaaS (Hosted) Deployment

The simplest way to use Knowrithm is through our fully managed SaaS offering.

- **No Infrastructure Management**: We handle all the scaling, maintenance, and security.
- **Automatic Updates**: Always have access to the latest features and security patches.
- **99.9% Uptime SLA**: Guaranteed reliability for your business-critical applications.

To get started, simply [sign up for an account](https://app.knowrithm.org/register) and get your API keys from the dashboard.

---

## 🐳 Docker Deployment

Deploying with Docker is ideal for creating a consistent environment for development and staging.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29+)

### Step 1: Create Project Structure

```bash
mkdir knowrithm-self-hosted
cd knowrithm-self-hosted
touch docker-compose.yml .env
mkdir -p uploads logs backups
```

### Step 2: Configure Docker Compose

Paste the following into your `docker-compose.yml` file.

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: knowrithm/platform:latest
    restart: always
    ports:
      - "8543:8543"
    environment:
      - POSTGRES_URL=postgresql://knowrithm_user:your_strong_password@db:5432/knowrithm_db
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  db:
    image: postgres:13-alpine
    restart: always
    environment:
      - POSTGRES_DB=knowrithm_db
      - POSTGRES_USER=knowrithm_user
      - POSTGRES_PASSWORD=your_strong_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups

  redis:
    image: redis:6-alpine
    restart: always
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Step 3: Set Environment Variables

Create a `.env` file to store your secrets. **Never commit this file to version control.**

```ini
# .env

# Generate with: openssl rand -hex 32
SECRET_KEY=your_super_secret_flask_key
JWT_SECRET_KEY=your_super_secret_jwt_key

# Your Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Run the Application

```bash
# Start all services in the background
docker-compose up -d

# Check the status of your containers
docker-compose ps

# View logs for the application
docker-compose logs -f app

# To stop the services
docker-compose down
```

---

## ☸️ Kubernetes Deployment

For production workloads, Kubernetes provides scalability, resilience, and high availability.

### Prerequisites
- A running Kubernetes cluster (e.g., GKE, EKS, AKS, or local like Minikube).
- `kubectl` command-line tool configured to connect to your cluster.
- `helm` for package management (optional but recommended).

### Option 1: Using Helm (Recommended)

```bash
# Add the Knowrithm Helm repository
helm repo add knowrithm https://charts.knowrithm.org
helm repo update

# Create a values.yaml file to configure your deployment
cat > values.yaml << EOF
replicaCount: 3

image:
  repository: knowrithm/platform
  tag: latest

secrets:
  # Use Kubernetes secrets for sensitive data
  apiKey: "your-api-key"
  apiSecret: "your-api-secret"
  databaseUrl: "your-production-db-url"

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: knowrithm.yourdomain.com
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls:
   - secretName: knowrithm-tls
     hosts:
       - knowrithm.yourdomain.com
EOF

# Install the chart
helm install knowrithm knowrithm/knowrithm -f values.yaml --namespace knowrithm --create-namespace
```

### Option 2: Manual Deployment with YAML

Use the Kubernetes manifests provided in the Platform Guide README as a starting point.

1.  **Create Secrets**: First, create Kubernetes secrets to store your sensitive data.
    ```bash
    kubectl create secret generic knowrithm-secrets \
      --from-literal=API_KEY='your-api-key' \
      --from-literal=API_SECRET='your-api-secret' \
      --from-literal=DATABASE_URL='your-production-db-url'
    ```

2.  **Apply Manifests**: Apply the `Deployment` and `Service` manifests.
    ```bash
    kubectl apply -f deployment.yaml
    kubectl apply -f service.yaml
    ```

3.  **Configure Ingress**: Set up an Ingress controller (like NGINX or Traefik) to expose the service to the internet.

---

## 🔄 CI/CD Pipeline

Automate your deployment process with a CI/CD pipeline.

### Example GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: your-docker-repo/knowrithm-platform:latest

  deploy-to-k8s:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG }}

      - name: Deploy with Helm
        run: |
          helm upgrade --install knowrithm knowrithm/knowrithm \
            --namespace knowrithm \
            --set image.tag=${{ github.sha }}
```

---

## 🗄️ Database Migrations

When deploying updates, you may need to run database migrations.

```bash
# For Docker Compose
docker-compose exec app flask db upgrade

# For Kubernetes
kubectl exec -it <your-app-pod-name> -- flask db upgrade
```

---

## Next Steps

- **Configure Security**: Secure your deployment with best practices.
  Security Guide
- **Set Up Monitoring**: Implement monitoring and alerting for your platform.
  Monitoring Guide
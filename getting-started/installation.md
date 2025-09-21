# Installation Guide

Get Knowrithm up and running in your environment with our comprehensive installation guide. We support multiple deployment options to fit your development workflow and production requirements.

---

## 🎯 Before You Begin

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Python** | 3.8+ | 3.11+ |
| **Memory** | 4 GB RAM | 8 GB+ RAM |
| **Storage** | 10GB free | 50GB+ free |
| **Network** | Stable internet | High-speed connection |
| **OS** | Linux, macOS, Windows | Linux (Ubuntu 20.04+) |

### Prerequisites Checklist

- [ ] Python 3.8 or higher installed
- [ ] pip package manager available
- [ ] Git for version control
- [ ] Text editor or IDE (VS Code, PyCharm)
- [ ] Terminal/Command prompt access
- [ ] Knowrithm account ([Sign up here](https://app.knowrithm.org/register))

{% hint style="info" %}
**New to Python?** We recommend using [pyenv](https://github.com/pyenv/pyenv) for Python version management and [pipenv](https://pipenv.pypa.io/) or [poetry](https://python-poetry.org/) for dependency management.
{% endhint %}

---

## Quick Installation (5 minutes)

The fastest way to get started with Knowrithm:

### Option 1: Using pip (Recommended)

```bash
# Install the Knowrithm Python SDK
pip install knowrithm-py

# Verify installation
python -c "import knowrithm_py; print('✅ Knowrithm installed successfully!')"
```

### Option 2: Using conda

```bash
# Install from conda-forge
conda install -c conda-forge knowrithm-py

# Or create a new environment
conda create -n knowrithm python=3.11
conda activate knowrithm
conda install -c conda-forge knowrithm-py
```

### Option 3: Using poetry

```bash
# Add to your project
poetry add knowrithm-py

# Or create new project
poetry new my-knowrithm-project
cd my-knowrithm-project
poetry add knowrithm-py
```

---

## Docker Installation

Perfect for containerized development and production deployments:

### Quick Docker Setup

```bash
# Pull the official Knowrithm image
docker pull knowrithm/platform:latest

# Run with basic configuration
docker run -d \
  --name knowrithm-app \
  -p 8543:8543 \
  -e API_KEY=your-api-key \
  -e API_SECRET=your-api-secret \
  knowrithm/platform:latest

# Check if it's running
docker ps
curl http://localhost:8543/health
```

### Docker Compose (Full Stack)

Create a `docker-compose.yml` file.

```yaml
version: '3.8'

services:
  app:
    image: knowrithm/platform:latest
    ports:
      - "8543:8543"
    environment:
      - DATABASE_URL=postgresql://knowrithm:password@db:5432/knowrithm
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=knowrithm
      - POSTGRES_USER=knowrithm
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

Start the stack:

```bash
# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Check service health
docker-compose ps
docker-compose logs app
```

---

## Kubernetes Installation

For production-grade orchestration:

### Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Using Helm Chart

```bash
# Add Knowrithm Helm repository
helm repo add knowrithm https://charts.knowrithm.org
helm repo update

# Create namespace
kubectl create namespace knowrithm

# Install with custom values
helm install knowrithm knowrithm/knowrithm \
  --namespace knowrithm \
  --set api.key="your-api-key" \
  --set api.secret="your-api-secret" \
  --set ingress.enabled=true \
  --set ingress.hostname="knowrithm.yourdomain.com"

# Check deployment status
kubectl get pods -n knowrithm
kubectl get services -n knowrithm
```

### Manual Kubernetes Deployment

Create `k8s-deployment.yaml`.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: knowrithm
---
apiVersion: v1
kind: Secret
metadata:
  name: knowrithm-secrets
  namespace: knowrithm
type: Opaque
stringData:
  api-key: "your-api-key"
  api-secret: "your-api-secret"
  database-url: "postgresql://user:pass@db:5432/knowrithm"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: knowrithm-app
  namespace: knowrithm
spec:
  replicas: 3
  selector:
    matchLabels:
      app: knowrithm
  template:
    metadata:
      labels:
        app: knowrithm
    spec:
      containers:
      - name: knowrithm
        image: knowrithm/platform:latest
        ports:
        - containerPort: 8543
        env:
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: knowrithm-secrets
              key: api-key
        - name: API_SECRET
          valueFrom:
            secretKeyRef:
              name: knowrithm-secrets
              key: api-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /health
            port: 8543
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8543
          initialDelaySeconds: 60
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: knowrithm-service
  namespace: knowrithm
spec:
  selector:
    app: knowrithm
  ports:
  - port: 80
    targetPort: 8543
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f k8s-deployment.yaml
kubectl get all -n knowrithm
```

---

## Development Environment Setup

### Virtual Environment (Recommended)

```bash
# Create project directory
mkdir my-knowrithm-project
cd my-knowrithm-project

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Knowrithm
pip install knowrithm-py

# Create requirements file
pip freeze > requirements.txt
```

### Using pyenv + pipenv

```bash
# Install Python 3.11 with pyenv
pyenv install 3.11.0
pyenv local 3.11.0

# Create project with pipenv
pipenv install knowrithm-py
pipenv shell

# Add development dependencies
pipenv install --dev pytest black flake8 mypy
```

### IDE Setup

#### Visual Studio Code (VS Code)

Install recommended extensions:

```bash
# Install VS Code extensions
code --install-extension ms-python.python
code --install-extension ms-python.flake8
code --install-extension ms-python.black-formatter
code --install-extension ms-python.mypy-type-checker
```

Create `.vscode/settings.json`:

```json
{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "python.linting.mypyEnabled": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    }
}
```

#### PyCharm

1. Open PyCharm and create new project
2. Select "Virtual Environment" as interpreter
3. Install Knowrithm plugin from marketplace
4. Configure code style to use Black formatter

---

## 🌍 Environment Configuration

### Environment Variables

Create a `.env` file:

```bash
# API Configuration
KNOWRITHM_API_KEY=your-api-key-here
KNOWRITHM_API_SECRET=your-api-secret-here
KNOWRITHM_BASE_URL=https://app.knowrithm.org

# Database Configuration (for self-hosted)
DATABASE_URL=postgresql://user:password@localhost:5432/knowrithm
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret

# AI Service
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@domain.com
SMTP_PASSWORD=your-email-password

# File Storage
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=52428800

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/knowrithm.log
```

### Load Environment Variables

```python
# config.py
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # API Configuration
    API_KEY = os.getenv('KNOWRITHM_API_KEY')
    API_SECRET = os.getenv('KNOWRITHM_API_SECRET')
    BASE_URL = os.getenv('KNOWRITHM_BASE_URL', 'https://app.knowrithm.org')
    
    # Validation
    if not API_KEY or not API_SECRET:
        raise ValueError("API credentials not found in environment variables")
    
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL')
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    # File Storage
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads')
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 52428800))  # 50MB
```

---

## ✅ Installation Verification

### Basic Verification

```python
# test_installation.py
import os
from knowrithm_py import KnowrithmClient

def test_installation():
    """Test basic Knowrithm installation"""
    try:
        # Test import
        print("✅ Knowrithm SDK imported successfully")
        
        # Test client initialization
        client = KnowrithmClient(
            api_key="test-key",
            api_secret="test-secret",
            base_url="https://app.knowrithm.org"
        )
        print("✅ Client initialized successfully")
        
        # Test with real credentials (if available)
        if os.getenv('KNOWRITHM_API_KEY'):
            real_client = KnowrithmClient(
                api_key=os.getenv('KNOWRITHM_API_KEY'),
                api_secret=os.getenv('KNOWRITHM_API_SECRET')
            )
            
            # Test API connection
            profile = real_client.auth.get_profile()
            print(f"✅ API connection successful! User: {profile.get('first_name', 'Unknown')}")
        else:
            print("ℹ️  Set KNOWRITHM_API_KEY and KNOWRITHM_API_SECRET to test API connection")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_installation()
    exit(0 if success else 1)
```

Run the test:

```bash
python test_installation.py
```

### Complete System Check

```python
# system_check.py
import sys
import subprocess
import importlib
from pathlib import Path

def check_python_version():
    """Check Python version compatibility"""
    version = sys.version_info
    if version >= (3, 8):
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} (compatible)")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} (requires 3.8+)")
        return False

def check_dependencies():
    """Check required dependencies"""
    required_packages = [
        'requests',
        'urllib3',
        'python-dotenv',
        'pydantic',
        'httpx'
    ]
    
    missing = []
    for package in required_packages:
        try:
            importlib.import_module(package.replace('-', '_'))
            print(f"✅ {package} installed")
        except ImportError:
            print(f"❌ {package} missing")
            missing.append(package)
    
    return len(missing) == 0

def check_environment():
    """Check environment configuration"""
    required_dirs = ['./uploads', './logs']
    
    for dir_path in required_dirs:
        path = Path(dir_path)
        if path.exists():
            print(f"✅ Directory {dir_path} exists")
        else:
            print(f"ℹ️  Creating directory {dir_path}")
            path.mkdir(parents=True, exist_ok=True)
    
    return True

def check_network():
    """Check network connectivity"""
    try:
        import requests
        response = requests.get('https://app.knowrithm.org/health', timeout=10)
        if response.status_code == 200:
            print("✅ Network connectivity to Knowrithm API")
            return True
        else:
            print(f"⚠️  Knowrithm API returned status {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ Network connectivity failed: {e}")
        return False

def main():
    """Run complete system check"""
    print("🔍 Running Knowrithm system check...\n")
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Environment", check_environment),
        ("Network", check_network)
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n📋 Checking {name}:")
        result = check_func()
        results.append(result)
    
    print("\n" + "="*50)
    if all(results):
        print("🎉 All checks passed! Knowrithm is ready to use.")
        return 0
    else:
        print("⚠️  Some checks failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    exit(main())
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "knowrithm_py not found"

```bash
# Solution 1: Check virtual environment
which python
which pip

# Solution 2: Reinstall in current environment
pip uninstall knowrithm-py
pip install knowrithm-py

# Solution 3: Check PYTHONPATH
python -c "import sys; print('\n'.join(sys.path))"
```

#### Issue: "SSL Certificate verification failed"

```bash
# Solution 1: Update certificates
pip install --upgrade certifi

# Solution 2: Use trusted hosts (temporary)
pip install --trusted-host pypi.org --trusted-host pypi.python.org knowrithm-py
```

#### Issue: "Permission denied" on Linux/macOS

```bash
# Solution 1: Use user installation
pip install --user knowrithm-py

# Solution 2: Fix permissions
sudo chown -R $(whoami) /usr/local/lib/python*/site-packages/
```

#### Issue: "Memory error during installation"

```bash
# Solution: Use no-cache option
pip install --no-cache-dir knowrithm-py

# Or increase virtual memory temporarily
export TMPDIR=/path/to/large/tmp/directory
pip install knowrithm-py
```

### Performance Optimization

```python
# optimize_installation.py
import os
import multiprocessing

def optimize_pip():
    """Optimize pip for faster installations"""
    pip_config = """
[global]
cache-dir = ~/.pip/cache
trusted-host = pypi.org
               pypi.python.org
               files.pythonhosted.org

[install]
compile = no
no-cache-dir = false
"""
    
    config_dir = Path.home() / '.pip'
    config_dir.mkdir(exist_ok=True)
    
    with open(config_dir / 'pip.conf', 'w') as f:
        f.write(pip_config)
    
    print("✅ pip configuration optimized")

def set_environment_vars():
    """Set optimal environment variables"""
    optimal_vars = {
        'PYTHONIOENCODING': 'utf-8',
        'PYTHONUNBUFFERED': '1',
        'PIP_DISABLE_PIP_VERSION_CHECK': '1',
        'PIP_NO_CACHE_DIR': '0',
        'MAKEFLAGS': f'-j{multiprocessing.cpu_count()}'
    }
    
    for var, value in optimal_vars.items():
        os.environ[var] = value
        print(f"✅ Set {var}={value}")

if __name__ == "__main__":
    optimize_pip()
    set_environment_vars()
```

---

## 📚 Next Steps

After successful installation:

1. **[Complete Authentication Setup](authentication.md)** - Get your API credentials
2. **[Follow Quick Start Guide](quick-start.md)** - Build your first agent
3. **[Explore Python SDK](../python-sdk/)** - Learn all available features
4. **[Try Tutorials](../tutorials/)** - Real-world implementation examples

---

## 🆘 Getting Help

If you encounter issues during installation:

### Quick Solutions
- Check our [FAQ](../resources/faq.md) for common issues
- Review [Troubleshooting Guide](../resources/troubleshooting.md)
- Verify system requirements above

### Community Support
- 💬 **Discord**: [Join our community](https://discord.gg/cHHWfghJrR)
- 📧 **Email**: support@knowrithm.org
- 🐛 **GitHub Issues**: [Report bugs](https://github.com/Knowrithm/knowrithm-py/issues)

### Enterprise Support
- 📞 **Phone Support**: Available for enterprise customers
- 🎯 **Priority Support**: Guaranteed response times
- 👨‍💻 **Technical Account Manager**: Dedicated technical contact

---

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; color: white; text-align: center; margin: 32px 0;">

**Installation Complete? Let's Build Something Amazing!**

[Set Up Authentication](authentication.md) • [Quick Start Tutorial](quick-start.md) • [Join Discord](https://discord.gg/cHHWfghJrR)

</div>
# Client Setup

Learn how to configure the Knowrithm Python SDK client with advanced options for production environments, error handling, and performance optimization.

## Basic Client Configuration

### Simple Initialization

```python
from knowrithm_py.knowrithm.client import KnowrithmClient

# Basic client setup
client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret",
    base_url="https://app.knowrithm.org"
)
```

### Environment-based Configuration

```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = KnowrithmClient(
    api_key=os.getenv('KNOWRITHM_API_KEY'),
    api_secret=os.getenv('KNOWRITHM_API_SECRET'),
    base_url=os.getenv('KNOWRITHM_BASE_URL', 'https://app.knowrithm.org'),
    debug=os.getenv('KNOWRITHM_DEBUG', 'False').lower() == 'true'
)
```

## Advanced Configuration Options

### Complete Configuration

```python
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.config import ClientConfig

# Advanced configuration
config = ClientConfig(
    api_key="your-api-key",
    api_secret="your-api-secret",
    base_url="https://app.knowrithm.org",
    
    # Network settings
    timeout=30,                    # Request timeout in seconds
    max_retries=3,                # Maximum retry attempts
    retry_delay=1.0,              # Delay between retries (exponential backoff)
    
    # Connection pooling
    connection_pool_size=10,       # Maximum connections in pool
    connection_pool_maxsize=20,    # Maximum pool size
    
    # Rate limiting
    rate_limit_requests=100,       # Requests per minute
    rate_limit_burst=10,          # Burst limit
    
    # Logging and debugging
    debug=False,                  # Enable debug logging
    log_level='INFO',             # Logging level
    log_requests=False,           # Log all requests/responses
    
    # Security
    verify_ssl=True,              # Verify SSL certificates
    user_agent='Knowrithm-Python-SDK/1.0.0'
)

client = KnowrithmClient(config=config)
```

### Configuration from File

```python
# config.yaml
knowrithm:
  api_key: ${KNOWRITHM_API_KEY}
  api_secret: ${KNOWRITHM_API_SECRET}
  base_url: https://app.knowrithm.org
  timeout: 30
  max_retries: 3
  debug: false
  connection_pool_size: 10
```

```python
import yaml
from knowrithm_py.knowrithm.client import KnowrithmClient

def load_config_from_file(config_path):
    """Load configuration from YAML file"""
    with open(config_path, 'r') as file:
        config_data = yaml.safe_load(file)
    
    # Expand environment variables
    knowrithm_config = config_data['knowrithm']
    for key, value in knowrithm_config.items():
        if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
            env_var = value[2:-1]
            knowrithm_config[key] = os.getenv(env_var)
    
    return knowrithm_config

# Load and use configuration
config = load_config_from_file('config.yaml')
client = KnowrithmClient(**config)
```

## Connection Management

### Connection Pooling

```python
from knowrithm_py.knowrithm.client import KnowrithmClient
from urllib3.util.retry import Retry

# Custom retry strategy
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
)

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret",
    connection_pool_size=15,
    retry_strategy=retry_strategy
)
```

### Context Manager Usage

```python
# Automatic resource cleanup
with KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
) as client:
    # Use client services
    agent_service = AgentService(client)
    agents = agent_service.list()
    
    # Client automatically closed when exiting
```

### Connection Health Monitoring

```python
import time
import logging

class HealthMonitoredClient:
    def __init__(self, client_config):
        self.client = KnowrithmClient(**client_config)
        self.logger = logging.getLogger(__name__)
        self.last_health_check = 0
        self.health_check_interval = 300  # 5 minutes
    
    def health_check(self):
        """Check client health and connectivity"""
        current_time = time.time()
        
        if current_time - self.last_health_check < self.health_check_interval:
            return True
        
        try:
            from knowrithm_py.services.auth import AuthService
            auth_service = AuthService(self.client)
            result = auth_service.validate_credentials()
            
            if result.get('valid'):
                self.last_health_check = current_time
                self.logger.info("Client health check passed")
                return True
            else:
                self.logger.error("Client health check failed: Invalid credentials")
                return False
                
        except Exception as e:
            self.logger.error(f"Client health check failed: {e}")
            return False
    
    def get_client(self):
        """Get client after health check"""
        if self.health_check():
            return self.client
        else:
            raise RuntimeError("Client health check failed")

# Usage
monitored_client = HealthMonitoredClient({
    'api_key': os.getenv('KNOWRITHM_API_KEY'),
    'api_secret': os.getenv('KNOWRITHM_API_SECRET')
})

client = monitored_client.get_client()
```

## Error Handling & Resilience

### Custom Exception Handling

```python
from knowrithm_py.exceptions import (
    KnowrithmError,
    AuthenticationError,
    AuthorizationError,
    RateLimitError,
    NetworkError,
    ValidationError
)

def robust_client_setup():
    """Set up client with comprehensive error handling"""
    try:
        client = KnowrithmClient(
            api_key=os.getenv('KNOWRITHM_API_KEY'),
            api_secret=os.getenv('KNOWRITHM_API_SECRET'),
            timeout=30,
            max_retries=3
        )
        
        # Validate connection
        from knowrithm_py.services.auth import AuthService
        auth_service = AuthService(client)
        validation = auth_service.validate_credentials()
        
        if not validation.get('valid'):
            raise AuthenticationError("Invalid credentials")
        
        return client
        
    except AuthenticationError as e:
        logging.error(f"Authentication failed: {e}")
        raise
    except NetworkError as e:
        logging.error(f"Network error during client setup: {e}")
        raise
    except Exception as e:
        logging.error(f"Unexpected error during client setup: {e}")
        raise KnowrithmError(f"Client setup failed: {e}")

# Use robust setup
try:
    client = robust_client_setup()
    print("✅ Client setup successful")
except KnowrithmError as e:
    print(f"❌ Client setup failed: {e}")
    exit(1)
```

### Retry Mechanisms

```python
import time
import random
from functools import wraps
from knowrithm_py.exceptions import RateLimitError, NetworkError

def retry_with_backoff(max_retries=3, base_delay=1, max_delay=60, jitter=True):
    """Decorator for retrying operations with exponential backoff"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                    
                except RateLimitError as e:
                    last_exception = e
                    if attempt == max_retries:
                        break
                    
                    # Respect rate limit headers
                    retry_after = getattr(e, 'retry_after', None)
                    if retry_after:
                        time.sleep(retry_after)
                    else:
                        delay = min(base_delay * (2 ** attempt), max_delay)
                        if jitter:
                            delay *= (0.5 + random.random() * 0.5)
                        time.sleep(delay)
                        
                except NetworkError as e:
                    last_exception = e
                    if attempt == max_retries:
                        break
                    
                    delay = min(base_delay * (2 ** attempt), max_delay)
                    if jitter:
                        delay *= (0.5 + random.random() * 0.5)
                    time.sleep(delay)
                    
                except Exception as e:
                    # Don't retry on other exceptions
                    raise e
            
            # All retries exhausted
            raise last_exception
            
        return wrapper
    return decorator

# Usage example
@retry_with_backoff(max_retries=3)
def create_agent_with_retry(agent_service, agent_data):
    return agent_service.create(agent_data)
```

## Async Client Support

### Async Client Setup

```python
import asyncio
from knowrithm_py.async_client import AsyncKnowrithmClient
from knowrithm_py.services.async_agent import AsyncAgentService

async def async_client_example():
    """Example of async client usage"""
    async with AsyncKnowrithmClient(
        api_key=os.getenv('KNOWRITHM_API_KEY'),
        api_secret=os.getenv('KNOWRITHM_API_SECRET'),
        max_concurrent_requests=10
    ) as client:
        
        agent_service = AsyncAgentService(client)
        
        # Create multiple agents concurrently
        agent_tasks = []
        for i in range(5):
            task = agent_service.create({
                "name": f"Agent {i}",
                "description": f"Async created agent {i}"
            })
            agent_tasks.append(task)
        
        # Wait for all to complete
        agents = await asyncio.gather(*agent_tasks)
        print(f"Created {len(agents)} agents concurrently")
        
        return agents

# Run async example
agents = asyncio.run(async_client_example())
```

### Async with Rate Limiting

```python
import asyncio
import aiohttp
from asyncio import Semaphore

class RateLimitedAsyncClient:
    def __init__(self, client_config, requests_per_second=10):
        self.client = AsyncKnowrithmClient(**client_config)
        self.semaphore = Semaphore(requests_per_second)
        self.last_request_time = 0
        self.min_interval = 1.0 / requests_per_second
    
    async def __aenter__(self):
        await self.client.__aenter__()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.__aexit__(exc_type, exc_val, exc_tb)
    
    async def rate_limited_request(self, coro):
        """Execute coroutine with rate limiting"""
        async with self.semaphore:
            # Ensure minimum interval between requests
            current_time = time.time()
            time_since_last = current_time - self.last_request_time
            
            if time_since_last < self.min_interval:
                await asyncio.sleep(self.min_interval - time_since_last)
            
            self.last_request_time = time.time()
            return await coro

# Usage
async def rate_limited_example():
    async with RateLimitedAsyncClient({
        'api_key': os.getenv('KNOWRITHM_API_KEY'),
        'api_secret': os.getenv('KNOWRITHM_API_SECRET')
    }, requests_per_second=5) as rate_limited_client:
        
        agent_service = AsyncAgentService(rate_limited_client.client)
        
        # These requests will be rate limited
        tasks = []
        for i in range(10):
            task = rate_limited_client.rate_limited_request(
                agent_service.create({
                    "name": f"Rate Limited Agent {i}",
                    "description": "Agent created with rate limiting"
                })
            )
            tasks.append(task)
        
        agents = await asyncio.gather(*tasks)
        return agents
```

## Environment-Specific Configurations

### Development Configuration

```python
# dev_config.py
DEVELOPMENT_CONFIG = {
    'api_key': os.getenv('DEV_KNOWRITHM_API_KEY'),
    'api_secret': os.getenv('DEV_KNOWRITHM_API_SECRET'),
    'base_url': 'https://dev-api.knowrithm.org',
    'debug': True,
    'log_requests': True,
    'timeout': 60,  # Longer timeout for debugging
    'max_retries': 1,  # Fewer retries in development
    'verify_ssl': False  # If using self-signed certs
}
```

### Production Configuration

```python
# prod_config.py
PRODUCTION_CONFIG = {
    'api_key': os.getenv('PROD_KNOWRITHM_API_KEY'),
    'api_secret': os.getenv('PROD_KNOWRITHM_API_SECRET'),
    'base_url': 'https://app.knowrithm.org',
    'debug': False,
    'log_requests': False,
    'timeout': 30,
    'max_retries': 3,
    'connection_pool_size': 20,
    'rate_limit_requests': 1000,
    'verify_ssl': True
}
```

### Configuration Factory

```python
import os
from enum import Enum

class Environment(Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class ClientConfigFactory:
    @staticmethod
    def create_config(environment: Environment = None):
        """Create configuration based on environment"""
        if environment is None:
            env_name = os.getenv('ENVIRONMENT', 'development').lower()
            environment = Environment(env_name)
        
        base_config = {
            'api_key': os.getenv('KNOWRITHM_API_KEY'),
            'api_secret': os.getenv('KNOWRITHM_API_SECRET'),
        }
        
        if environment == Environment.DEVELOPMENT:
            return {
                **base_config,
                'base_url': 'https://dev-api.knowrithm.org',
                'debug': True,
                'log_requests': True,
                'timeout': 60,
                'max_retries': 1
            }
        
        elif environment == Environment.STAGING:
            return {
                **base_config,
                'base_url': 'https://staging-api.knowrithm.org',
                'debug': False,
                'log_requests': True,
                'timeout': 30,
                'max_retries': 2
            }
        
        else:  # Production
            return {
                **base_config,
                'base_url': 'https://app.knowrithm.org',
                'debug': False,
                'log_requests': False,
                'timeout': 30,
                'max_retries': 3,
                'connection_pool_size': 20
            }

# Usage
config = ClientConfigFactory.create_config()
client = KnowrithmClient(**config)
```

## Logging and Monitoring

### Structured Logging

```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        handler = logging.StreamHandler()
        handler.setFormatter(self.JsonFormatter())
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    class JsonFormatter(logging.Formatter):
        def format(self, record):
            log_entry = {
                'timestamp': datetime.utcnow().isoformat(),
                'level': record.levelname,
                'message': record.getMessage(),
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno
            }
            
            if hasattr(record, 'extra'):
                log_entry.update(record.extra)
            
            return json.dumps(log_entry)

# Configure client with structured logging
logger = StructuredLogger('knowrithm_client')

class LoggingClient(KnowrithmClient):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logger.logger
    
    def _make_request(self, method, endpoint, **kwargs):
        start_time = time.time()
        
        try:
            response = super()._make_request(method, endpoint, **kwargs)
            
            self.logger.info(
                f"API request successful",
                extra={
                    'method': method,
                    'endpoint': endpoint,
                    'duration_ms': (time.time() - start_time) * 1000,
                    'status_code': response.status_code
                }
            )
            
            return response
            
        except Exception as e:
            self.logger.error(
                f"API request failed",
                extra={
                    'method': method,
                    'endpoint': endpoint,
                    'duration_ms': (time.time() - start_time) * 1000,
                    'error': str(e)
                }
            )
            raise
```

### Performance Monitoring

```python
import time
import psutil
from contextlib import contextmanager

class PerformanceMonitor:
    def __init__(self):
        self.metrics = []
    
    @contextmanager
    def monitor_operation(self, operation_name):
        """Context manager to monitor operation performance"""
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        start_cpu = psutil.cpu_percent()
        
        try:
            yield
        finally:
            end_time = time.time()
            end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            end_cpu = psutil.cpu_percent()
            
            metrics = {
                'operation': operation_name,
                'duration_seconds': end_time - start_time,
                'memory_delta_mb': end_memory - start_memory,
                'cpu_usage_percent': (start_cpu + end_cpu) / 2,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            self.metrics.append(metrics)
            
            # Log performance metrics
            logger.info(
                f"Operation completed: {operation_name}",
                extra=metrics
            )
    
    def get_performance_summary(self):
        """Get performance summary"""
        if not self.metrics:
            return {}
        
        durations = [m['duration_seconds'] for m in self.metrics]
        memory_deltas = [m['memory_delta_mb'] for m in self.metrics]
        
        return {
            'total_operations': len(self.metrics),
            'avg_duration_seconds': sum(durations) / len(durations),
            'max_duration_seconds': max(durations),
            'avg_memory_delta_mb': sum(memory_deltas) / len(memory_deltas),
            'total_memory_delta_mb': sum(memory_deltas)
        }

# Usage
monitor = PerformanceMonitor()

# Monitor client operations
with monitor.monitor_operation('agent_creation'):
    agent = agent_service.create(agent_data)

with monitor.monitor_operation('document_upload'):
    doc = document_service.upload('file.pdf', agent_id=agent['id'])

# Get performance summary
summary = monitor.get_performance_summary()
print(f"Performance Summary: {json.dumps(summary, indent=2)}")
```

## Testing Client Configuration

### Unit Tests for Client Setup

```python
import unittest
from unittest.mock import patch, MagicMock
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.exceptions import AuthenticationError

class TestClientSetup(unittest.TestCase):
    
    def setUp(self):
        self.valid_config = {
            'api_key': 'test_key',
            'api_secret': 'test_secret',
            'base_url': 'https://test.knowrithm.org'
        }
    
    def test_valid_client_initialization(self):
        """Test client initializes with valid configuration"""
        client = KnowrithmClient(**self.valid_config)
        
        self.assertIsNotNone(client)
        self.assertEqual(client.api_key, 'test_key')
        self.assertEqual(client.base_url, 'https://test.knowrithm.org')
    
    def test_invalid_credentials(self):
        """Test client handles invalid credentials"""
        with self.assertRaises(ValueError):
            KnowrithmClient(api_key="", api_secret="")
    
    @patch('knowrithm_py.services.auth.AuthService.validate_credentials')
    def test_credential_validation(self, mock_validate):
        """Test credential validation"""
        mock_validate.return_value = {'valid': True}
        
        client = KnowrithmClient(**self.valid_config)
        from knowrithm_py.services.auth import AuthService
        
        auth_service = AuthService(client)
        result = auth_service.validate_credentials()
        
        self.assertTrue(result['valid'])
        mock_validate.assert_called_once()
    
    def test_timeout_configuration(self):
        """Test timeout configuration"""
        config = {**self.valid_config, 'timeout': 60}
        client = KnowrithmClient(**config)
        
        self.assertEqual(client.timeout, 60)
    
    def test_debug_mode(self):
        """Test debug mode configuration"""
        config = {**self.valid_config, 'debug': True}
        client = KnowrithmClient(**config)
        
        self.assertTrue(client.debug)

if __name__ == '__main__':
    unittest.main()
```

### Integration Tests

```python
import pytest
import os
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.services.auth import AuthService

@pytest.fixture
def client():
    """Fixture for test client"""
    return KnowrithmClient(
        api_key=os.getenv('TEST_KNOWRITHM_API_KEY'),
        api_secret=os.getenv('TEST_KNOWRITHM_API_SECRET'),
        base_url=os.getenv('TEST_KNOWRITHM_BASE_URL', 'https://test.knowrithm.org')
    )

@pytest.mark.integration
def test_client_authentication(client):
    """Test client can authenticate with real API"""
    auth_service = AuthService(client)
    result = auth_service.validate_credentials()
    
    assert result.get('valid') is True
    assert 'user' in result
    assert 'company' in result

@pytest.mark.integration  
def test_client_connection_health(client):
    """Test client connection health"""
    # Test basic connectivity
    auth_service = AuthService(client)
    
    # Should not raise exception
    result = auth_service.get_api_key_info()
    assert 'permissions' in result

@pytest.mark.integration
def test_client_rate_limiting(client):
    """Test client handles rate limiting appropriately"""
    from knowrithm_py.services.agent import AgentService
    agent_service = AgentService(client)
    
    # Make multiple requests rapidly
    agents = []
    for i in range(5):
        try:
            agent = agent_service.create({
                'name': f'Test Agent {i}',
                'description': 'Rate limiting test'
            })
            agents.append(agent)
        except Exception as e:
            # Should handle rate limiting gracefully
            assert 'rate limit' in str(e).lower() or len(agents) > 0
    
    # Clean up
    for agent in agents:
        try:
            agent_service.delete(agent['id'])
        except:
            pass

# Run integration tests/your-app
# pytest -m integration test_client_integration.py
```

## Next Steps

Now that you have your client configured:
1. **Create Agents**: [Set up your AI agents](agents.md)
2. **Handle Conversations**: [Manage chat interactions](conversations.md)
3. **Process Documents**: [Upload and train with documents](documents.md)
4. **Monitor Performance**: [Track metrics and analytics](analytics.md)

{{ hint style="success" }}
**Client Ready!** Your Knowrithm client is properly configured with error handling, monitoring, and production-ready settings.
{{ endhint }}

{{ hint style="tip" }}
**Pro Tip**: Use environment-specific configurations and structured logging from the start. It will make debugging and monitoring much easier as you scale.
{{ endhint }}

{{ hint style="warning" }}
**Production Note**: Always use connection pooling, rate limiting, and proper retry mechanisms in production environments to ensure reliability and performance.
{{ endhint }}
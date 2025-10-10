# Client Setup

Set up the Knowrithm Python SDK for local development, staging, or production environments. The `KnowrithmClient` centralizes authentication, retry policies, and service accessors.

---

## Basic Initialization

```python
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
    timeout=30,
    max_retries=3,
    enable_logging=True
)
```

**Parameters**
- `api_key` and `api_secret`: API credentials with the required scopes.
- `base_url`: Override if you target a staging or self-hosted environment.
- `timeout`: Per-request timeout in seconds.
- `max_retries`: Automatic retry attempts for transient failures.
- `enable_logging`: Toggle basic request logging for development.

All arguments are optional beyond the credentials; defaults align with the hosted service.

---

## Environment Configuration

Use environment variables or `.env` files to manage credentials.

```python
import os
from dotenv import load_dotenv
from knowrithm_py.knowrithm.client import KnowrithmClient

load_dotenv()

client = KnowrithmClient(
    api_key=os.environ["KNOWRITHM_API_KEY"],
    api_secret=os.environ["KNOWRITHM_API_SECRET"]
)
```

For multi-environment deploys, store per-environment values (for example `KNOWRITHM_API_KEY_PROD`) and select them via feature flags or runtime configuration.

---

## Custom Session Options

```python
client = KnowrithmClient(
    api_key="key",
    api_secret="secret",
    timeout=20,
    max_retries=5,
    retry_backoff_factor=1.2,
    verify_ssl=True,
    user_agent="KnowrithmSDK/1.1"
)
```

Additional keyword arguments:
- `retry_status_codes`: list of HTTP codes that trigger retries (default includes 429/5xx).
- `retry_backoff_factor`: exponential backoff starting point in seconds.
- `verify_ssl`: disable only for trusted internal testing.
- `user_agent`: override the default header for observability.

---

## Working with JWT Headers

When acting on behalf of an authenticated user rather than using API keys, supply JWT headers per request.

```python
jwt_headers = {"Authorization": "Bearer <access-token>"}

agent = client.agents.create_agent(
    {"name": "JWT Agent"},
    headers=jwt_headers
)
```

Every service method accepts the optional `headers` parameter to override default authentication.

---

## Health Checks and Validation

```python
client.auth.validate_credentials()
client.analytics.health_check()
```

Run these helpers during application boot to fail fast if credentials or connectivity are invalid.

---

## Production Recommendations

- **Secrets**: Store API keys in a vault (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault).
- **Retries**: Tune `max_retries` and `retry_backoff_factor` to match deployment SLAs.
- **Telemetry**: Pipe client logs into centralized observability (Datadog, CloudWatch, etc.).
- **Rotation**: Rotate API keys regularly and monitor usage via `client.api_keys`.
- **Timeouts**: Adjust `timeout` for longer-running ingestion endpoints, but avoid unbounded values.

Refer to the [agents](agents.md), [conversations](conversations.md), and [documents](documents.md) guides once the client is configured.







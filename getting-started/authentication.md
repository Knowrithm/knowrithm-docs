# Authentication Guide

Knowrithm supports API key authentication for automation and JWT authentication for user-context actions. This guide covers generating credentials and validating access with the Python SDK.

---

## Generate API Keys

1. Sign in at https://app.knowrithm.org.
2. Open **Settings -> API Keys**.
3. Create a key with the scopes you need (`read`, `write`, `admin`).
4. Copy both the key and secret- the secret is shown once.

Store credentials in a secure vault or environment variables.

---

## Initialize the Client

```python
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret",
    timeout=30
)
```

Environment variables example:

```python
import os
from dotenv import load_dotenv

load_dotenv()

client = KnowrithmClient(
    api_key=os.environ["KNOWRITHM_API_KEY"],
    api_secret=os.environ["KNOWRITHM_API_SECRET"],
    base_url=os.getenv("KNOWRITHM_BASE_URL", "https://app.knowrithm.org")
)
```

---

## Validate Credentials

```python
validation = client.auth.validate_credentials()
print(validation["user"]["email"], validation["company"]["name"])
```

If validation raises `KnowrithmAPIError`, verify your key, secret, and network connectivity.

---

## Using JWTs

When acting on behalf of authenticated dashboard users:

1. Call `/v1/auth/login` with email and password to obtain access and refresh tokens.
2. Attach the access token to each request:

```python
jwt_headers = {"Authorization": "Bearer <access-token>"}
user_profile = client.auth.get_current_user(headers=jwt_headers)
```

Refresh tokens via `POST /v1/auth/refresh` before access tokens expire.

---

## Security Tips

- Rotate API keys regularly and remove unused keys.
- Limit permissions to the minimal scopes required.
- Use different keys per environment (development, staging, production).
- Log request IDs from error responses for faster support escalation.

---

## Related Resources

- [API authentication reference](../api-reference/authentication.md)
- [Client setup](../python-sdk/client-setup.md)
- [Quick start tutorial](quick-start.md)







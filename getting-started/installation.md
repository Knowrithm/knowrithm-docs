# Installation Guide

Install the Knowrithm Python SDK and prepare your environment for development or production.

---

## Requirements

- Python 3.8+
- pip (or poetry/conda)
- Knowrithm account with API credentials

Optional dependencies:
- `python-dotenv` for loading `.env` files
- `requests` for supplementary HTTP calls

---

## Install the SDK

```bash
pip install knowrithm-py
```

Verify:

```bash
python -c "import knowrithm_py; print('Knowrithm ready')"
```

Alternative package managers:

```bash
poetry add knowrithm-py
conda install -c conda-forge knowrithm-py
```

---

## Configure Credentials

Create a `.env` file:

```text
KNOWRITHM_API_KEY=your-api-key
KNOWRITHM_API_SECRET=your-api-secret
KNOWRITHM_BASE_URL=https://app.knowrithm.org
```

Load in Python:

```python
from dotenv import load_dotenv
from knowrithm_py.knowrithm.client import KnowrithmClient
import os

load_dotenv()

client = KnowrithmClient(
    api_key=os.environ["KNOWRITHM_API_KEY"],
    api_secret=os.environ["KNOWRITHM_API_SECRET"],
    base_url=os.getenv("KNOWRITHM_BASE_URL", "https://app.knowrithm.org")
)
```

---

## Optional: Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install knowrithm-py
```

---

## Connectivity Check

```python
client.auth.validate_credentials()
client.analytics.health_check()
```

These calls confirm your credentials and API availability.

---

## Next Steps

- [Authenticate and manage credentials](authentication.md)
- [Follow the quick start](quick-start.md)
- [Explore the Python SDK reference](../python-sdk/README.md)

If installation issues arise, review the [troubleshooting guide](../resources/troubleshooting.md) or contact support@knowrithm.org.







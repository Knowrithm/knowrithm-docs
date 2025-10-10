# Getting Started with Knowrithm

This guide walks you through installing the Knowrithm Python SDK, configuring authentication, and creating your first agent in just a few minutes.

## Prerequisites

- Python 3.8 or higher
- A Knowrithm account with API access
- Generated API credentials (`X-API-Key` and `X-API-Secret`) or a JWT setup
- Basic familiarity with Python

---

## Step 1: Install the SDK

```bash
pip install knowrithm-py
```

Verify the installation:

```bash
python -c "import knowrithm_py; print('Knowrithm SDK ready!')"
```

For source installs or local development, see `python-sdk/README.md`.

---

## Step 2: Configure Credentials

Store credentials securely (environment variables or a `.env` file):

```env
KNOWRITHM_API_KEY=your-api-key
KNOWRITHM_API_SECRET=your-api-secret
KNOWRITHM_BASE_URL=https://app.knowrithm.org
```

Load them in your application:

```python
import os
from dotenv import load_dotenv
from knowrithm_py.knowrithm.client import KnowrithmClient

load_dotenv()

client = KnowrithmClient(
    api_key=os.getenv("KNOWRITHM_API_KEY"),
    api_secret=os.getenv("KNOWRITHM_API_SECRET"),
    base_url=os.getenv("KNOWRITHM_BASE_URL")
)
```

> Prefer scoped API keys for automation. When using JWTs, supply them per call via the `headers` argument.

---

## Step 3: Create Your First Agent

```python
agent = client.agents.create_agent({
    "name": "Support Bot",
    "description": "Handles customer inquiries",
    "status": "active"
})

print(f"Agent created: {agent['id']}")
```

---

## Step 4: Upload Supporting Knowledge

```python
from pathlib import Path

client.documents.upload_documents(
    agent_id=agent["id"],
    file_paths=[Path("knowledge-base.pdf")]
)
```

You can also ingest URLs or provide metadata. See `python-sdk/documents.md` for advanced options.

---

## Step 5: Start a Conversation

```python
conversation = client.conversations.create_conversation(agent_id=agent["id"])

reply = client.messages.send_message(
    conversation_id=conversation["id"],
    message="Hello there!"
)

print(reply["history"][-1]["assistant_response"])
```

Conversations automatically scope to the authenticated entity (user, company, or lead).

---

## Step 6: Verify Connectivity

```python
from knowrithm_py.dataclass.error import KnowrithmAPIError

try:
    client.auth.get_current_user()
    print("API connection verified.")
except KnowrithmAPIError as exc:
    print(f"Verification failed ({exc.status_code}): {exc.message}")
```

Run `pytest` (if available) or call `/health` on the backend to confirm the environment is healthy.

---

## Recommended Workflow

1. Use a virtual environment to isolate dependencies.
2. Store secrets outside source control.
3. Start with the default retry and timeout settings; adjust for production workloads.
4. Enable logging (`KnowrithmClient(..., enable_logging=True)`) while developing.

---

## Next Steps

- Dive deeper into the [Python SDK](../python-sdk/README.md).
- Explore the [API Reference](../api-reference/README.md) for endpoint details.
- Follow a guided build in `tutorials/building-first-agent.md`.

If you need help, visit the [support resources](../resources/README.md) or join the community Discord.







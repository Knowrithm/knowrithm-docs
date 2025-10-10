# Agent Management

This guide explains how to create, configure, and operate agents with the Knowrithm Python SDK. Agents encapsulate the personality, knowledge, and capabilities that drive automated customer or employee experiences.

---

## Service Overview

All agent operations are exposed through `KnowrithmClient.agents`, which maps one-to-one with the `/v1/agent` REST endpoints.

```python
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
)

agents = client.agents  # AgentService instance
```

---

## Create Agents

The minimal payload requires `name`. Optional fields align with the API schema (`description`, `status`, `llm_settings_id`, `avatar_url`, etc.).

```python
agent = agents.create_agent({
    "name": "Support Desk",
    "description": "First-line support for common account questions",
    "status": "active"
})

print(agent["id"])
```

For company or agent scoped LLM settings, supply `llm_settings_id` or create settings via `client.settings`.

---

## Retrieve and List Agents

```python
# Fetch a single agent (public route)
public_agent = agents.get_agent(agent["id"])

# Paginated list with filters
page = agents.list_agents(
    status="active",
    search="Support",
    page=1,
    per_page=10
)

for record in page["items"]:
    print(record["id"], record["name"])
```

The list method forwards query params such as `company_id` (super admin), `status`, `search`, and pagination controls.

---

## Update, Delete, Restore

```python
updated = agents.update_agent(agent["id"], {
    "description": "Handles account unlocks and password resets",
    "status": "active"
})

# Soft delete
agents.delete_agent(agent["id"])

# Restore
agents.restore_agent(agent["id"])
```

Deletes are soft by default, enabling restoration through `/v1/agent/<id>/restore`.

---

## Widget Embed Code and Tests

```python
embed = agents.get_embed_code(agent["id"])
print(embed["script"])

# Run a test prompt
test = agents.test_agent(agent["id"], query="How do I reset my password?")
print(test["response"]["content"])
```

Use these helpers to verify agent configuration before exposing the widget to end users.

---

## Agent Analytics

Integrate with the Analytics service for health and performance metrics.

```python
stats = agents.get_agent_stats(agent["id"])
print(stats["conversation_count"], stats["satisfaction"]["avg_rating"])

from datetime import date
metrics = client.analytics.get_agent_analytics(
    agent_id=agent["id"],
    start_date=date(2025, 9, 1).isoformat(),
    end_date=date(2025, 9, 30).isoformat()
)
```

Complement analytics with the dashboard endpoints for comparative benchmarks.

---

## Training Data (Documents and Databases)

Agents respond using company data associated with them. Attach documents or database connections through the respective services.

```python
from pathlib import Path

client.documents.upload_documents(
    agent_id=agent["id"],
    file_paths=[Path("faq.pdf")]
)

client.databases.create_connection(
    name="Support Knowledge DB",
    url="postgresql://user:pass@host/db",
    database_type="postgres",
    agent_id=agent["id"]
)
```

See `documents.md` and `databases.md` for ingestion details.

---

## Full Lifecycle Example

```python
def lifecycle_demo(client):
    svc = client.agents

    created = svc.create_agent({"name": "Lifecycle Bot"})
    agent_id = created["id"]

    svc.update_agent(agent_id, {"status": "active"})
    svc.get_agent(agent_id)
    svc.list_agents()

    svc.delete_agent(agent_id)
    svc.restore_agent(agent_id)

    svc.delete_agent(agent_id)  # final cleanup

# lifecycle_demo(client)
```

---

## Best Practices

- Use dedicated agents per domain (sales, support, onboarding) to maintain context.
- Keep descriptions and prompts up to date with product changes.
- Link agents to LLM settings via `client.settings` to centralize provider configuration.
- Monitor `client.analytics.get_agent_performance_comparison` to benchmark agents against company averages.

Refer to the [API Reference](../api-reference/agents.md) for the full schema and response fields.







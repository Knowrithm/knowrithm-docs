# Analytics Service

The Analytics service exposes reporting endpoints for agents, conversations, usage, and leads. Each helper in `KnowrithmClient.analytics` maps to the `/v1/analytic/*` blueprints documented in the API reference.

---

## Getting Started

```python
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
)

analytics = client.analytics
```

All methods accept optional `headers` overrides if you need to supply JWT tokens instead of API keys.

---

## Dashboard Overview

`get_dashboard_overview` surfaces company-wide totals for documents, conversations, leads, and agent activity. Super admins can scope by `company_id`.

```python
summary = analytics.get_dashboard_overview()
print(summary["agents"]["active_count"])
```

---

## Agent Analytics

Two helpers provide deep insight into agent performance:

```python
metrics = analytics.get_agent_analytics(
    agent_id="agent-id",
    start_date="2025-09-01",
    end_date="2025-09-30"
)

comparison = analytics.get_agent_performance_comparison(
    agent_id="agent-id",
    start_date="2025-09-01",
    end_date="2025-09-30"
)
```

Use these payloads to monitor satisfaction scores, response latencies, and conversation counts alongside company averages.

---

## Conversation Analytics

Inspect a single conversation with `get_conversation_analytics` to troubleshoot context, topic detection, and engagement metrics.

```python
conversation_metrics = analytics.get_conversation_analytics("conversation-id")
print(conversation_metrics["message_statistics"]["agent_message_count"])
```

---

## Leads and Usage

```python
lead_report = analytics.get_lead_analytics(
    start_date="2025-09-01",
    end_date="2025-09-30"
)

usage = analytics.get_usage_metrics(
    start_date="2025-09-01",
    end_date="2025-09-30"
)
```

Leverage `get_usage_metrics` for platform-level throughput, API volume, and error rates.

---

## Search and Export

Analytics also exposes semantic search endpoints that align with the dashboard blueprint.

```python
search_results = analytics.search_documents(
    query="reset password policy",
    agent_id="agent-id",
    limit=5
)

database_hits = analytics.search_database(
    query="sales by quarter",
    connection_id="connection-id"
)
```

Export historical data in JSON or CSV using `export_analytics`.

```python
export_job = analytics.export_analytics(
    export_type="conversations",
    export_format="csv",
    start_date="2025-09-01",
    end_date="2025-09-30"
)

print(export_job.get("download_url"))
```

---

## Health and System Metrics

Trigger a new system metric collection or run a lightweight health probe:

```python
analytics.trigger_system_metric_collection()

health = analytics.health_check()
print(health["status"])
```

---

## Best Practices

- Align `start_date` and `end_date` with ISO 8601 strings (YYYY-MM-DD) for clarity.
- Store generated exports in object storage for downstream BI processing.
- Combine analytics calls with the leads and conversations services to correlate qualitative logs with quantitative trends.

Refer to the [API analytics reference](../api-reference/analytics.md) for field descriptions and supported query parameters.







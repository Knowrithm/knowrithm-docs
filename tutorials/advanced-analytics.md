# Advanced Analytics Tutorial

Build custom dashboards, compare agent performance, and export raw data using the analytics endpoints.

---

## Setup

```python
from datetime import date, timedelta
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
)

analytics = client.analytics
agents = client.agents.list_agents(page=1, per_page=10)["items"]
```

---

## Dashboard Snapshot

```python
overview = analytics.get_dashboard_overview()
print("Active agents:", overview["agents"]["active_count"])
print("Conversations today:", overview["conversations"]["today"])
```

Use optional `company_id` when operating as a super admin.

---

## Agent Performance

```python
start = (date.today() - timedelta(days=30)).isoformat()
end = date.today().isoformat()

for record in agents:
    metrics = analytics.get_agent_analytics(
        agent_id=record["id"],
        start_date=start,
        end_date=end
    )
    convs = metrics["conversation_metrics"]["total_conversations"]
    rating = metrics["quality_metrics"]["avg_satisfaction_rating"]
    latency = metrics["performance_metrics"]["avg_response_time_seconds"]
    print(record["name"], convs, rating, latency)
```

---

## Compare Against Company Average

```python
comparison = analytics.get_agent_performance_comparison(
    agent_id=agents[0]["id"],
    start_date=start,
    end_date=end
)

diff = comparison["performance_comparison"]
print("Satisfaction delta:", diff["satisfaction_rating"]["performance_vs_average_percent"])
print("Response time delta:", diff["response_time"]["performance_vs_average_percent"])
```

Positive numbers indicate performance above average; negative numbers indicate below-average metrics.

---

## Conversation Analytics

```python
conversation_id = client.conversations.list_conversations(page=1, per_page=1)["items"][0]["id"]
conversation_metrics = analytics.get_conversation_analytics(conversation_id)
print(conversation_metrics["message_statistics"])
```

---

## Export Data

```python
export = analytics.export_analytics(
    export_type="conversations",
    export_format="csv",
    start_date=start,
    end_date=end
)

csv_data = export.get("data")
download_url = export.get("download_url")

if csv_data:
    with open("conversations.csv", "w", encoding="utf-8") as f:
        f.write(csv_data)
elif download_url:
    print("Download export from:", download_url)
```

Exports support `conversations`, `leads`, `agents`, and `usage` in CSV or JSON formats.

---

## Usage Metrics

```python
usage = analytics.get_usage_metrics(start_date=start, end_date=end)
print("API calls:", usage["api_usage"]["total_api_calls"])
print("Error rate:", usage["api_usage"]["error_rate_percent"])
```

---

## Automation Ideas

- Schedule scripts (cron, Airflow) to email weekly dashboards.
- Feed CSV exports into Tableau, Power BI, or pandas for additional visualization.
- Combine analytics results with webhook events to trace conversions end-to-end.

For a full endpoint list, see the [analytics API reference](../api-reference/analytics.md).







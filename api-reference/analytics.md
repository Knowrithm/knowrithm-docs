# Analytics API

The Analytics API provides access to a wide range of metrics for monitoring performance, engagement, and usage across the platform.

---

## Key Endpoints

Most analytics endpoints accept `start_date` and `end_date` query parameters in ISO 8601 format (e.g., `2024-01-01T00:00:00Z`) to define the reporting period.

### Get Main Dashboard

`GET /analytic/dashboard`

Retrieves a high-level summary of key metrics for the main dashboard, including agent counts, active conversations, and recent lead activity.

### Get Agent Metrics

`GET /analytic/agent/{agent_id}`

Returns detailed performance, quality, and engagement metrics for a single agent over a specified time period.

**Success Response Snippet:**
```json
{
  "performance_metrics": {
    "avg_response_time_seconds": 2.8
  },
  "quality_metrics": {
    "avg_satisfaction_rating": 4.5
  },
  "conversation_metrics": {
    "total_conversations": 150
  }
}
```

### Get Conversation Analytics

`GET /analytic/conversation/{conversation_id}`

Provides a detailed breakdown of a single conversation, including message statistics, duration, and topic analysis.

### Get Lead Analytics

`GET /analytic/leads`

Returns analytics related to the lead generation funnel, including total leads, conversion rates, and top-performing sources.

### Get Usage Metrics

`GET /analytic/usage`

Provides platform-level API usage statistics, including total API calls, average response times, and error rates.

### Export Analytics Data

`POST /analytic/export`

Exports raw data for conversations, leads, or messages in JSON or CSV format for offline analysis.

**Request Body:**
```json
{
  "type": "conversations",
  "format": "csv",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "filters": { "agent_id": "agent_123" }
}
```
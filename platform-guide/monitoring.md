# Monitoring & Observability 📈

This guide covers best practices and tools for monitoring the health, performance, and security of your Knowrithm platform deployment.

---

## 🎯 Monitoring Philosophy

Effective monitoring is key to maintaining a reliable and performant platform. Our approach focuses on the "Three Pillars of Observability":

1.  **Metrics**: Aggregated numerical data that provides a high-level view of system health (e.g., request rates, error percentages).
2.  **Logs**: Detailed, timestamped records of specific events, essential for debugging and root cause analysis.
3.  **Traces**: A complete view of a request's lifecycle as it travels through different services, used for performance profiling.

---

## 🩺 Health Checks

The platform includes a built-in health check endpoint to quickly assess the status of the core services.

**Endpoint**: `GET /health`

**Success Response (200 OK)**:
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "celery": "running"
}
```

**Failure Response (503 Service Unavailable)**:
```json
{
  "status": "unhealthy",
  "database": "connected",
  "redis": "disconnected",
  "celery": "not_running"
}
```

This endpoint is ideal for use with Kubernetes readiness/liveness probes or other automated health monitoring systems.

---

## 📊 Key Metrics to Monitor

We recommend monitoring the following key performance indicators (KPIs).

### Application Metrics
-   **API Request Rate**: The number of requests per second/minute to your API endpoints.
-   **API Error Rate**: The percentage of requests that result in a 5xx server error. A sudden spike indicates a problem.
-   **API Latency (p95, p99)**: The 95th and 99th percentile response times for your API. This is a better indicator of user experience than average latency.

### Agent Performance Metrics
-   **Agent Response Time**: The average time it takes for an agent to generate a response after receiving a message.
-   **User Satisfaction Score**: The average rating (1-5) provided by users at the end of conversations.
-   **Conversation Volume**: The number of new conversations started per hour/day.

### System Metrics
-   **CPU Utilization**: Monitor the CPU usage of your application, database, and worker containers.
-   **Memory Usage**: Track memory consumption to detect memory leaks.
-   **Disk Space**: Monitor disk space on your database and log storage volumes.
-   **Celery Queue Length**: A consistently growing queue indicates that your background workers cannot keep up with the task load and may need to be scaled up.

---

## 🪵 Logging

The platform uses structured logging (JSON format) to make logs easy to parse, search, and analyze.

### Log Levels
-   **`ERROR`**: Critical errors that require immediate attention (e.g., database connection failure, unhandled exceptions).
-   **`WARNING`**: Potential issues that do not immediately break functionality but should be investigated (e.g., high response times, API deprecation warnings).
-   **`INFO`**: Standard operational messages (e.g., user login, agent created, document processed).
-   **`DEBUG`**: Verbose, detailed information useful for debugging specific issues. Should be disabled in production by default.

### Example Log Entry

```json
{
  "timestamp": "2024-05-21T14:30:00.123Z",
  "level": "INFO",
  "message": "Conversation started",
  "service": "conversation-engine",
  "conversation_id": "conv_123abc",
  "agent_id": "agent_456def",
  "company_id": "company_789ghi"
}
```

We recommend shipping your logs to a centralized logging platform like the **ELK Stack (Elasticsearch, Logstash, Kibana)**, **Grafana Loki**, or **Datadog** for powerful searching and visualization.

---

## 🔔 Alerting

Set up alerts to be notified proactively when issues arise.

### Recommended Alerts

| Alert Name | Condition | Severity |
|---|---|---|
| **High API Error Rate** | Error rate > 5% for 5 minutes | Critical |
| **High API Latency** | p99 latency > 2000ms for 5 minutes | Warning |
| **Celery Queue Growth** | Queue length > 1000 for 10 minutes | Critical |
| **High CPU/Memory Usage** | Utilization > 85% for 15 minutes | Warning |
| **Low Disk Space** | Free disk space < 10% | Critical |
| **Health Check Failure** | `/health` endpoint returns non-200 status | Critical |
| **Low Agent Satisfaction** | Average satisfaction score < 3.0 over 24 hours | Warning |

---

## 🛠️ Recommended Tooling

For a robust monitoring setup, we recommend the following open-source tools:

-   **Prometheus**: For collecting and storing time-series metrics. The application can be configured to expose a `/metrics` endpoint in a Prometheus-compatible format.
-   **Grafana**: For creating dashboards to visualize your metrics from Prometheus and logs from Loki or Elasticsearch.
-   **Alertmanager**: To handle alerts defined in Prometheus and route them to services like Slack, PagerDuty, or email.
-   **Loki** or **ELK Stack**: For centralized log aggregation and analysis.

### Example Grafana Dashboard Panels
-   API Request Rate & Error Percentage (Time Series)
-   API Latency Heatmap
-   Agent Performance Leaderboard (Table)
-   Celery Queue Length (Gauge)
-   CPU & Memory Usage per Service (Time Series)

---

## Next Steps

- **Deployment Guide**: Learn how to deploy the platform and its dependencies.
  {% content-ref url="deployment.md" %}
- **Security Guide**: Review security best practices for your deployment.
  {% content-ref url="security.md" %}
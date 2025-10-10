# Monitoring and Observability

Maintain availability by tracking health checks, metrics, logs, and alerts across the Knowrithm stack.

---

## Health Checks

- `/health`: verifies API process, PostgreSQL, Redis, and Celery connectivity.
- Use for container readiness/liveness probes or external uptime checks.

Example response:

```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "celery": "running"
}
```

Non-200 responses should trigger alerts.

---

## Metrics

Expose Prometheus-compatible metrics (via `/metrics` or sidecar exporters) to track:

| Category | Key Signals |
|----------|-------------|
| API | Request rate, 4xx/5xx counts, latency (p95/p99), queue depth |
| Workers | Celery task throughput, retry counts, backlog size |
| Agents | Conversation volume, avg response time, satisfaction scores |
| Infrastructure | CPU, memory, disk, network usage on API and worker nodes |
| Datastores | PostgreSQL connections, replication lag, Redis memory usage |

Recommended dashboards (Grafana):
- API latency heatmap and HTTP status distribution
- Celery queue length with autoscaling thresholds
- Agent leaderboard (conversations vs. satisfaction)
- Database and Redis resource utilization

---

## Logs

Use structured JSON logs with contextual fields (`company_id`, `agent_id`, `conversation_id`, `request_id`). Route logs to a centralized solution (Grafana Loki, ELK, Datadog, Splunk). Suggested log levels:

- `ERROR`: request failures, unhandled exceptions
- `WARNING`: degraded performance, partial failures
- `INFO`: lifecycle events (agent created, document processed)
- `DEBUG`: verbose diagnostics (enable selectively)

Include correlation IDs (`X-Knowrithm-Request-Id`) across services to trace events end-to-end.

---

## Tracing

Instrument critical flows (document ingestion, conversation handling) with OpenTelemetry or another tracing framework. Export to Jaeger, Tempo, or vendor services to analyze latency across API and worker boundaries.

---

## Alerting

Trigger notifications when thresholds are exceeded:

| Alert | Condition | Target |
|-------|-----------|--------|
| API error spike | 5xx rate > 5% for 5 minutes | PagerDuty / Slack |
| Latency regression | p99 > 2s for 5 minutes | Engineering |
| Worker backlog | Celery queue length > 1,000 for 10 minutes | Data ingestion team |
| Health check failure | `/health` non-200 | Ops |
| DB saturation | Connections > 80% of pool, or disk < 10% free | DBA |
| Low satisfaction | Avg rating < 3.0 over 24h | Customer success |

Use Alertmanager, Opsgenie, or equivalent. Ensure alerts include remediation playbooks.

---

## Instrumentation Checklist

- Enable request logging and request IDs in the API gateway/load balancer.
- Capture Celery task success/failure metrics.
- Export PostgreSQL and Redis metrics using exporters.
- Back up logs and metrics as required by compliance policies.
- Document runbooks for common incidents (API error spike, ingestion backlog, degraded LLM provider).

---

## Next Steps

- Configure deployment monitoring pipelines (see [deployment.md](deployment.md)).
- Apply security baselines (see [security.md](security.md)).
- Integrate business KPIs (lead conversions, agent SLA) into the same observability stack.







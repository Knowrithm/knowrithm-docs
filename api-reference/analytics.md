# Analytics API

Endpoints under `app/blueprints/dashboard/routes.py` deliver metrics, search, and exports. Authentication requires `X-API-Key` + `X-API-Secret` (scopes: `read` or `write` as noted) or `Authorization: Bearer <JWT>`.

Base path prefix: `/v1/analytic`

---

## Dashboard

### GET `/v1/analytic/dashboard`
- Headers: API key (`read`) or JWT
- Query params: optional `company_id` (super admin only)
- Response: company-level counts for agents, documents, conversations, leads, and usage trends

---

## Agent Metrics

### GET `/v1/analytic/agent/<agent_id>`
- Headers: API key (`read`) or JWT
- Query: `start_date`, `end_date` (ISO 8601, optional)
- Response: `performance_metrics`, `quality_metrics`, `conversation_metrics`

### GET `/v1/analytic/agent/<agent_id>/performance-comparison`
- Headers: API key (`read`) or JWT
- Query: `start_date`, `end_date`
- Response: comparisons against company averages for response times, satisfaction, and engagement

---

## Conversation Analytics

### GET `/v1/analytic/conversation/<conversation_id>`
- Headers: API key (`read`) or JWT
- Response: message statistics, duration, topics, sentiment (if enabled)

---

## Lead Analytics

### GET `/v1/analytic/leads`
- Headers: API key (`read`) or JWT
- Query: `start_date`, `end_date`, optional `company_id`
- Response: conversion funnel metrics, source breakdowns, growth trends

---

## Usage Metrics

### GET `/v1/analytic/usage`
- Headers: API key (`read`) or JWT
- Query: `start_date`, `end_date`
- Response: API call counts, latency, error rates, token usage (where applicable)

---

## Search

These endpoints live under the same blueprint even though they operate on documents and databases.

- **POST `/v1/search/document`**
  - Headers: API key (`write`) or JWT
  - Body: `query` (string), `agent_id` (UUID), optional `limit` (max 50)
  - Response: semantic search matches with scores and content snippets

- **POST `/v1/search/database`**
  - Headers: API key (`write`) or JWT
  - Body: `query` (string), optional `connection_id`
  - Response: relevant tables or records depending on provider configuration

---

## System Metrics

- **POST `/v1/system-metric`**
  - Headers: API key (`write`) or JWT
  - Purpose: trigger asynchronous system metric collection (results retrieved via other endpoints)

- **GET `/health`**
  - Headers: none
  - Response: status of the API, database, Redis, and Celery

---

## Exports

- **POST `/v1/analytic/export`**
  - Headers: API key (`read`) or JWT
  - Body:
    ```json
    {
      "type": "conversations",
      "format": "csv",
      "start_date": "2025-09-01",
      "end_date": "2025-09-30"
    }
    ```
  - `type`: `conversations`, `leads`, `agents`, or `usage`
  - `format`: `json` or `csv`
  - Response: export metadata (download URL or inline data depending on size)

---

## Notes

- Date parameters accept ISO 8601 strings (`YYYY-MM-DD` or full timestamps).
- Super admins can scope analytics across companies where supported.
- Export responses may require polling for completion if a background job is triggered (implementation dependent).
- Use the Python SDK's `analytics` service for typed access to each endpoint.







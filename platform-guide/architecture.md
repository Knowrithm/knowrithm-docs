# System Architecture

Knowrithm is a multi-tenant platform built on Flask, Celery, PostgreSQL, Redis, and an AI/ML layer that integrates external LLM providers. The architecture emphasizes isolation, scalability, and extensibility.

---

## Layered View

```
Clients: Dashboard, SDK, REST, Widget
           |
API Gateway (Flask)
           |
Services: Authentication, Agents, Conversations, Documents, Databases, Analytics
           |
Workers: Celery for ingestion, embeddings, exports, notifications
           |
Data Stores: PostgreSQL, Redis, Object Storage, Vector Search
           |
AI Providers: LLMs, Embedding models
```

### Key Components

- **Flask API**: Stateless REST endpoints under `/v1/*`.
- **Celery Workers**: Handle asynchronous tasks (document processing, database analysis, analytics exports).
- **PostgreSQL**: Primary relational store; every table is scoped by `company_id`.
- **Redis**: Caching, conversation short-term storage, and Celery broker.
- **Object Storage**: Durable storage for uploads and exports.
- **Vector Database**: Embedding index for semantic retrieval.
- **AI Layer**: External LLM providers (for example Gemini) and embedding engines.

---

## Data Flows

### Document Ingestion
1. Upload document via `/v1/document/upload`.
2. File stored in object storage, job queued.
3. Worker parses text, performs OCR if needed, generates embeddings.
4. Chunks and vectors persisted (vector DB + PostgreSQL metadata).

### Conversation Handling
1. Client calls `/v1/conversation/<id>/chat`.
2. Recent history and metadata fetched from Redis/PostgreSQL.
3. Query embedding generated; semantic search retrieves relevant chunks.
4. Prompt composed and sent to the configured LLM.
5. Response streamed back, persisted to conversation log, analytics updated.

---

## Multi-Tenancy Safeguards

- Company and agent IDs enforced in every query.
- Separate encryption keys and signing secrets per tenant.
- Webhooks, API keys, and JWTs scoped to individual companies.
- Optional domain allowlists for widget deployments.

---

## Scalability Considerations

- Horizontal scaling for API pods and Celery workers.
- Connection pooling for PostgreSQL; caches for hot metadata.
- Optional read replicas or analytics warehouses for heavy reporting.
- Observability via metrics (Prometheus/Grafana), structured logs, and tracing.

---

## Extensibility

- Providers (LLM, embeddings) configured through `/v1/providers` and `/v1/settings`.
- Webhooks and exports allow downstream integration without modifying the core stack.
- SDK mirrors REST endpoints for language-agnostic extensibility.

For deployment guidance see [deployment.md](deployment.md), and for security practices review [security.md](security.md).








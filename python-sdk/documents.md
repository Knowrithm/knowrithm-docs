# Document Operations

Attach documents and links to agents so they can answer questions using company knowledge. The `KnowrithmClient.documents` service maps to `/v1/document` routes.

---

## Upload Documents

```python
from pathlib import Path

upload_job = client.documents.upload_documents(
    agent_id="agent-id",
    file_paths=[Path("docs/handbook.pdf")],
    metadata={"department": "support", "version": "2025.09"}
)

print(upload_job["status"])
```

`upload_documents` accepts any combination of `file_paths`, `urls`, `url`, and `metadata`. The API handles asynchronous ingestion; monitor status through the list endpoints.

---

## List and Inspect Documents

```python
documents = client.documents.list_documents(
    agent_id="agent-id",
    status="processed",
    page=1,
    per_page=20
)

for doc in documents["items"]:
    print(doc["id"], doc["filename"], doc["status"])
```

Use `list_deleted_documents` or `list_deleted_chunks` to inspect soft-deleted resources.

---

## Delete and Restore

```python
client.documents.delete_document("document-id")
client.documents.restore_document("document-id")

client.documents.delete_document_chunks("document-id")
client.documents.restore_all_document_chunks("document-id")
```

Chunk-level helpers manage individual segments when fine-grained control is required.

---

## Semantic Search

```python
results = client.analytics.search_documents(
    query="How do I reset my password?",
    agent_id="agent-id",
    limit=5
)

for hit in results["matches"]:
    print(hit["score"], hit["content_snippet"])
```

The semantic search endpoint lives under the Analytics service because it is part of the dashboard blueprint.

---

## URL and Bulk Support

```python
client.documents.upload_documents(
    agent_id="agent-id",
    urls=[
        "https://docs.example.com/faq",
        "https://docs.example.com/policies/security"
    ]
)
```

Bulk deletes are available through `bulk_delete_documents` with a list of document IDs.

---

## Status Monitoring

Polling the main listing or chunk endpoints will show updated statuses (`queued`, `processing`, `processed`, `failed`). If additional telemetry is needed, subscribe to document ingestion webhooks.

---

## Tips

- Upload focused documents (per topic) for better retrieval quality.
- Attach metadata fields such as `version`, `locale`, or `product` to enable filtering.
- Use object storage for large file management and pass signed URLs if direct uploads are not feasible.
- Keep original files so you can re-upload when policies or knowledge change.

Refer to [api-reference/documents.md](../api-reference/documents.md) for full field descriptions and request bodies.







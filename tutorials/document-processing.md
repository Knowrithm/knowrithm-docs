# Document Processing Tutorial

Train an agent with multiple document types and query the knowledge base. This tutorial assumes you already have an agent ID (see [Build Your First Agent](building-first-agent.md)).

---

## Setup

```python
from pathlib import Path
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
)

agent_id = "your-agent-id"
```

---

## Upload Unstructured Content

```python
Path("policy.txt").write_text(
    "Enterprise products include a three-year warranty.\n"
    "Standard products include a one-year warranty.\n"
    "Contact support@knowrithm.org for claims.\n"
)

client.documents.upload_documents(
    agent_id=agent_id,
    file_paths=[Path("policy.txt")],
    metadata={"document_type": "policy", "version": "2025.09"}
)
```

---

## Upload Structured Data (CSV)

```python
Path("products.csv").write_text(
    "product_id,name,price\n"
    "P-100,Quantum Widget,99.99\n"
    "P-200,Hyper Sprocket,149.50\n"
)

client.documents.upload_documents(
    agent_id=agent_id,
    file_paths=[Path("products.csv")],
    metadata={"document_type": "catalog"}
)
```

Wait a few seconds for ingestion. You can confirm via `client.documents.list_documents(agent_id=agent_id)`.

---

## Semantic Search

Use the analytics search endpoint to test relevance before chatting.

```python
results = client.analytics.search_documents(
    query="How long is the enterprise warranty?",
    agent_id=agent_id,
    limit=3
)

for hit in results["matches"]:
    print(hit["score"], hit["content_snippet"])
```

---

## Ask the Agent

```python
conversation = client.conversations.create_conversation(agent_id=agent_id)

questions = [
    "What warranty do enterprise products include?",
    "How much does the Hyper Sprocket cost?"
]

for prompt in questions:
    reply = client.messages.send_message(
        conversation_id=conversation["id"],
        message=prompt
    )
    print("Q:", prompt)
    print("A:", reply["history"][-1]["assistant_response"])
```

---

## Best Practices

- Split large manuals into topic-specific documents for better retrieval.
- Use metadata (for example `document_type`, `locale`) to filter search results.
- Re-upload documents when knowledge changes; the newest metadata can include a version identifier to track updates.
- Combine document ingestion with database exports or web scrapers for comprehensive coverage.

Next: connect live data sources with the [database integration tutorial](database-integration.md).







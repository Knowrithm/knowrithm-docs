# Quick Start

Create an agent, upload knowledge, and start a conversation in under ten minutes.

---

## 1. Initialize the Client

```python
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
)
```

---

## 2. Create an Agent

```python
agent = client.agents.create_agent({
    "name": "Quick Start Assistant",
    "description": "Answers common customer questions",
    "status": "active"
})

print(agent["id"])
```

---

## 3. Upload a Document

```python
from pathlib import Path

Path("faq.txt").write_text(
    "Q: What are your business hours?\n"
    "A: Monday to Friday, 9 AM - 5 PM EST.\n"
)

client.documents.upload_documents(
    agent_id=agent["id"],
    file_paths=[Path("faq.txt")]
)
```

Document ingestion runs asynchronously; check the document list to confirm processing.

---

## 4. Start a Conversation

```python
conversation = client.conversations.create_conversation(agent_id=agent["id"])

reply = client.messages.send_message(
    conversation_id=conversation["id"],
    message="What are your business hours?"
)

print(reply["history"][-1]["assistant_response"])
```

---

## 5. Inspect Analytics (Optional)

```python
stats = client.analytics.get_agent_analytics(
    agent_id=agent["id"],
    start_date="2025-09-01",
    end_date="2025-09-30"
)

print(stats["conversation_metrics"]["total_conversations"])
```

---

## Next Steps

- Add more knowledge sources (documents, databases, URLs).
- Embed the agent using the [website widget](../integrations/website-widget.md).
- Monitor performance with the [analytics API](../api-reference/analytics.md).

Need help? Visit the [troubleshooting guide](../resources/troubleshooting.md) or email support@knowrithm.org.







# Example Recipes

Quick snippets for common Knowrithm SDK tasks. Each example assumes an initialized `KnowrithmClient` instance named `client`.

---

## Create an Agent and Upload Knowledge

```python
agent = client.agents.create_agent({
    "name": "Pricing Assistant",
    "description": "Answers questions about subscription plans",
    "status": "active"
})

client.documents.upload_documents(
    agent_id=agent["id"],
    urls=["https://docs.example.com/pricing"]
)
```

---

## Start a Conversation and Send a Message

```python
conversation = client.conversations.create_conversation(agent_id=agent["id"])

reply = client.messages.send_message(
    conversation_id=conversation["id"],
    message="Do we offer annual discounts?"
)

print(reply["history"][-1]["assistant_response"])
```

---

## Register a Lead Through the API

```python
lead = client.leads.create_lead({
    "first_name": "Taylor",
    "last_name": "Morgan",
    "email": "taylor@example.com",
    "agent_id": agent["id"],
    "source": "webinar"
})

print(lead["id"])
```

---

## Fetch Agent Analytics

```python
metrics = client.analytics.get_agent_analytics(
    agent_id=agent["id"],
    start_date="2025-09-01",
    end_date="2025-09-30"
)

print(metrics["conversation_metrics"]["total_conversations"])
```

---

## Export Conversations to CSV

```python
export_job = client.analytics.export_analytics(
    export_type="conversations",
    export_format="csv",
    start_date="2025-09-01",
    end_date="2025-09-30"
)

print(export_job.get("download_url", "No export URL"))
```

---

## Delete and Restore a Document

```python
doc_id = client.documents.list_documents(agent_id=agent["id"])["items"][0]["id"]

client.documents.delete_document(doc_id)
client.documents.restore_document(doc_id)
```

---

## Validate Credentials

```python
validation = client.auth.validate_credentials()
print(validation["user"]["email"], validation["company"]["name"])
```

---

## Health Check Monitor

```python
def check_health():
    status = client.analytics.health_check()
    return status["status"] == "healthy"

if not check_health():
    raise RuntimeError("Knowrithm backend unhealthy")
```

These recipes serve as starting points for automation, cron jobs, or integrations. Extend them by combining multiple service calls or wrapping them in your application framework of choice.







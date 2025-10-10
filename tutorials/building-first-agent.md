# Build Your First Agent

Create a customer support agent, upload knowledge, and test it end-to-end. Estimated time: 15 minutes.

---

## 1. Project Setup

```bash
mkdir knowrithm-agent
cd knowrithm-agent
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install knowrithm-py python-dotenv
```

Create `.env`:

```text
KNOWRITHM_API_KEY=your-api-key
KNOWRITHM_API_SECRET=your-api-secret
```

---

## 2. Initialize the Client

```python
# support_agent.py
import os
from dotenv import load_dotenv
from knowrithm_py.knowrithm.client import KnowrithmClient

load_dotenv()

client = KnowrithmClient(
    api_key=os.environ["KNOWRITHM_API_KEY"],
    api_secret=os.environ["KNOWRITHM_API_SECRET"]
)
```

Validate credentials:

```python
client.auth.validate_credentials()
```

---

## 3. Create the Agent

```python
agent = client.agents.create_agent({
    "name": "Support Companion",
    "description": "Answers FAQ and account questions",
    "status": "active"
})

agent_id = agent["id"]
print("Agent created:", agent_id)
```

---

## 4. Upload Knowledge

```python
from pathlib import Path

Path("faq.txt").write_text(
    "Q: What are your business hours?\n"
    "A: Monday through Friday, 9 AM to 5 PM EST.\n\n"
    "Q: Do you offer refunds?\n"
    "A: Yes, contact support within 30 days.\n"
)

client.documents.upload_documents(
    agent_id=agent_id,
    file_paths=[Path("faq.txt")],
    metadata={"document_type": "faq", "version": "2025.09"}
)
```

Give the ingestion workers a few seconds to complete before testing.

---

## 5. Start a Conversation

```python
conversation = client.conversations.create_conversation(agent_id=agent_id)

questions = [
    "What are your business hours?",
    "How do refunds work?",
    "Can I upgrade my plan?"
]

for prompt in questions:
    result = client.messages.send_message(
        conversation_id=conversation["id"],
        message=prompt
    )
    answer = result["history"][-1]["assistant_response"]
    print("Q:", prompt)
    print("A:", answer)
```

---

## 6. Review Metrics

```python
metrics = client.analytics.get_agent_stats(agent_id)
print("Conversations:", metrics["conversation_count"])
```

For deeper analysis call `get_agent_analytics` with a date range.

---

## Cleanup (Optional)

```python
client.conversations.delete_conversation(conversation["id"])
client.agents.delete_agent(agent_id)
```

---

## Next Steps

- Upload PDFs or URLs to broaden the knowledge base.
- Connect a database (`client.databases.create_connection`) for live data.
- Embed the agent using the [website widget](../integrations/website-widget.md).
- Monitor engagement via the [analytics API](../api-reference/analytics.md).

Need help? Join the community Discord or email support@knowrithm.org.







# Webhooks

Receive real-time notifications when key events occur inside Knowrithm. Configure webhook subscriptions in the dashboard (Settings -> Integrations -> Webhooks) or via future API endpoints.

---

## How Webhooks Work

1. Provide a public HTTPS URL that accepts `POST` requests.
2. Choose the event types to subscribe to (for example `lead.created`, `conversation.started`).
3. Copy the generated signing secret.
4. Verify the `X-Knowrithm-Signature` header on every request using HMAC-SHA256.

Webhook deliveries include a JSON body with the following structure:

```json
{
  "event": "lead.created",
  "timestamp": "2025-09-01T12:04:00Z",
  "data": { ... },
  "attempt": 1
}
```

A signature header accompanies the payload:

```
X-Knowrithm-Signature: sha256=<hex digest>
```

Compute the digest using the raw request body and your signing secret.

---

## Common Events

| Event | Description |
|-------|-------------|
| `agent.created` | Agent record created |
| `agent.updated` | Agent attributes changed |
| `conversation.started` | Conversation opened for an agent |
| `conversation.ended` | Conversation soft-deleted or closed |
| `message.received` | User message received |
| `lead.created` | Lead registered through widget or API |
| `lead.updated` | Lead fields or status updated |
| `document.processed` | Document ingestion completed |

Event payloads mirror the REST resources; refer to the API reference for field descriptions.

---

## Signature Verification (Python Example)

```python
import hashlib
import hmac
from flask import Flask, request, abort, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = "replace-with-your-secret"

def verify_signature(payload: bytes, header_signature: str) -> bool:
    if not header_signature:
        return False
    digest = hmac.new(
        key=WEBHOOK_SECRET.encode("utf-8"),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()
    expected = f"sha256={digest}"
    return hmac.compare_digest(expected, header_signature)

@app.post("/webhooks/knowrithm")
def knowrithm_webhook():
    signature = request.headers.get("X-Knowrithm-Signature")
    body = request.get_data()

    if not verify_signature(body, signature):
        abort(403)

    event = request.json.get("event")
    data = request.json.get("data", {})

    if event == "lead.created":
        handle_new_lead(data)
    elif event == "conversation.started":
        handle_conversation_start(data)

    return jsonify({"status": "ok"})
```

Ensure your handler responds quickly; queue long-running tasks for background workers.

---

## Best Practices

- Store webhook secrets in a secure vault.
- Retry handlers should be idempotent: Knowrithm redelivers events when a non-2xx status is returned.
- Log request IDs (available in `X-Knowrithm-Request-Id`) for traceability.
- Use tools like ngrok during development to expose local endpoints.
- Keep firewall rules open for Knowrithm IP ranges if applicable.

---

## Next Steps

- [Leads API Reference](../api-reference/companies.md)
- [Conversations API Reference](../api-reference/conversations.md)
- [Analytics API Reference](../api-reference/analytics.md)







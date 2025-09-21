# Webhooks 🪝

Webhooks allow you to receive real-time notifications about events that happen in your Knowrithm account. By subscribing to events, you can build powerful integrations that connect your AI agents to your other business systems.

---

## 🎯 What are Webhooks?

A webhook is an automated message sent from an app when something happens. It's a simple `POST` request sent to a unique URL you provide, containing a payload of data about the event.

**Use Cases:**
-   **CRM Integration**: Automatically create a new lead in Salesforce or HubSpot when a `lead.created` event occurs.
-   **Support Ticketing**: Create a support ticket in Zendesk or Jira when a conversation is flagged for human review.
-   **Real-time Notifications**: Send a message to a Slack channel when a user gives a low satisfaction rating.
-   **Data Warehousing**: Push conversation logs to your data warehouse for long-term analysis.

---

## 🛠️ Setting Up a Webhook

1.  **Create an Endpoint**: First, you need a publicly accessible URL on your server that can receive `POST` requests. This is your webhook listener.

2.  **Add the Webhook in Knowrithm**:
    -   Navigate to **Settings → Integrations → Webhooks** in your Knowrithm dashboard.
    -   Click **"Add Endpoint"**.
    -   Enter your public URL.
    -   Select the events you want to subscribe to (e.g., `conversation.started`, `lead.created`).
    -   A unique **signing secret** will be generated for you. Copy this secret and store it securely. You'll need it to verify incoming requests.

---

## 📦 Event Types & Payloads

You can subscribe to various events. All payloads follow a standard structure.

### Example Payload (`lead.created`)

```json
{
  "event": "lead.created",
  "timestamp": "2024-05-21T10:30:00Z",
  "data": {
    "id": "lead_123abc",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "source": "website_chat",
    "company_id": "company_456def"
  },
  "signature": "sha256=a1b2c3d4e5f6..."
}
```

### Common Events

| Event Name | Description |
|---|---|
| `agent.created` | Triggered when a new agent is created. |
| `conversation.started` | Triggered when a new conversation begins. |
| `conversation.ended` | Triggered when a conversation is marked as ended. |
| `message.received` | Triggered when a new message is received from a user. |
| `lead.created` | Triggered when a new lead is registered. |
| `lead.status.updated` | Triggered when a lead's status changes (e.g., from `new` to `qualified`). |
| `document.processed` | Triggered when a document has finished processing. |

---

## 🔒 Verifying Signatures (Crucial for Security)

To ensure that incoming webhook requests are genuinely from Knowrithm and not from a malicious third party, you **must** verify the request's signature.

Each webhook request includes an `X-Knowrithm-Signature` header. This is an HMAC-SHA256 hash of the request body, signed with your unique webhook secret.

### Python Example: Verifying a Signature

Here is a simple example using Flask to create a webhook listener and verify the signature.

```python
import hmac
import hashlib
from flask import Flask, request, jsonify, abort

app = Flask(__name__)

# Store your secret securely, e.g., in an environment variable
WEBHOOK_SECRET = "your_webhook_signing_secret"

def verify_signature(payload, signature):
    """Verify the webhook signature."""
    if not signature:
        return False
    
    expected_signature = hmac.new(
        key=WEBHOOK_SECRET.encode('utf-8'),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    # Use hmac.compare_digest for secure, constant-time comparison
    return hmac.compare_digest(f"sha256={expected_signature}", signature)

@app.route('/webhooks/knowrithm', methods=['POST'])
def handle_webhook():
    # Get the signature from the header
    signature = request.headers.get('X-Knowrithm-Signature')
    
    # Get the raw request body
    payload = request.get_data()

    # Verify the signature
    if not verify_signature(payload, signature):
        print("⚠️ Invalid signature. Aborting.")
        abort(403) # Forbidden

    # If the signature is valid, process the event
    event_data = request.json
    event_type = event_data.get('event')

    print(f"✅ Received valid webhook event: {event_type}")

    if event_type == 'lead.created':
        lead = event_data['data']
        print(f"  -> New lead received: {lead['first_name']} {lead['last_name']} ({lead['email']})")
        # Add your logic here: add to CRM, send an email, etc.
    
    elif event_type == 'conversation.ended':
        conversation = event_data['data']
        if conversation.get('rating', 0) <= 2:
            print(f"  -> Low rating received for conversation {conversation['id']}. Notifying support.")
            # Add your logic here: create a support ticket, send a Slack message, etc.

    return jsonify({"status": "success"}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)
```

---

## ✨ Best Practices

-   **Always Verify Signatures**: This is the most important step to secure your webhook endpoint.
-   **Respond Quickly**: Your endpoint should respond with a `200 OK` status as quickly as possible. Offload any long-running tasks (like calling other APIs) to a background job queue (e.g., Celery, RQ) to avoid timeouts.
-   **Handle Retries**: Knowrithm will attempt to retry sending a webhook if your endpoint returns a non-2xx status code. Design your handler to be idempotent (i.e., receiving the same event multiple times does not cause duplicate actions).
-   **Use HTTPS**: Always use a secure `https://` URL for your webhook endpoint to protect the data in transit.

---

## 🔧 Troubleshooting

-   **403 Forbidden Errors**: If your handler is returning 403, it's almost always due to a signature verification failure. Double-check that you are using the correct webhook secret and that you are using the raw request body to generate the signature.
-   **Firewall Issues**: Ensure your server's firewall allows incoming `POST` requests from Knowrithm's IP addresses.
-   **Testing Locally**: Use a tool like ngrok to expose your local development server to the internet, allowing you to receive webhooks without deploying your code.
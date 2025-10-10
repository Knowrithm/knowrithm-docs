# Third-Party Integrations

Connect Knowrithm with CRM systems, help desks, automation tools, and internal services using webhooks and the REST/SDK interfaces.

---

## Current Options

- **Webhooks**: receive events (`lead.created`, `conversation.started`, etc.) and forward them to your CRM or ticketing system.
- **Python SDK / REST API**: poll or mutate resources programmatically.
- **Widgets**: embed agents on web properties and capture metadata for downstream automation.

Native connectors for Slack, Zapier, Salesforce, HubSpot, Zendesk, Intercom, and Twilio are on the roadmap. Contact support if you need early access or would like to participate in beta programs.

---

## No-Code Automation Pattern

Use a workflow platform (Zapier, Make, n8n) with a webhook trigger.

1. Generate a webhook URL in the automation tool.
2. Register it in the Knowrithm dashboard (`Settings -> Integrations -> Webhooks`), subscribing to events like `lead.created`.
3. Trigger a lead by interacting with an agent.
4. Map the payload fields to your target app (Google Sheets, Slack, CRM).

This pattern requires no custom code and delivers near real-time updates.

---

## Custom Service Pattern

Build a lightweight service with the Python SDK to orchestrate more complex workflows.

```python
from datetime import date, timedelta
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="api-key",
    api_secret="api-secret"
)

def sync_conversations():
    yesterday = date.today() - timedelta(days=1)
    page = client.conversations.list_conversations(
        page=1,
        per_page=100
    )
    for item in page["items"]:
        # push to data warehouse or CRM
        pass
```

Combine this service with webhook handlers to cover both push and pull data flows.

---

## Integration Ideas

- **CRM enrichment**: create or update contacts in Salesforce/HubSpot when conversations end with high intent.
- **Support escalation**: open tickets in Zendesk or Jira when a conversation receives a low satisfaction score.
- **Analytics pipeline**: stream conversation logs into a warehouse (Snowflake, BigQuery) for long-term analysis.
- **Notification hubs**: post message summaries to Slack or Microsoft Teams channels.

---

## Best Practices

- Keep webhook handlers idempotent; retries may deliver the same event multiple times.
- Use API keys with limited scopes for integration services.
- Store secrets in an encrypted vault and rotate them regularly.
- Document mapping logic between Knowrithm payloads and destination schemas to simplify maintenance.

See the [webhooks guide](webhooks.md), [API reference](../api-reference/README.md), and [SDK examples](../python-sdk/examples.md) for deeper implementation details.







# Integrations

Connect Knowrithm to your existing workflows, websites, and applications. This guide introduces the primary integration patterns and points you to detailed references for each option.

---

## Capabilities

- **Website widget**: drop-in chat widget powered by your agents.
- **Webhooks**: event-driven notifications for leads, conversations, and system changes.
- **REST API**: full control over agents, conversations, documents, analytics, and more.
- **Python SDK**: typed helpers for every documented endpoint.

---

## Website Chat Widget

Add the widget to any page by embedding the public script:

```html
<script
  src="https://app.knowrithm.org/widget.js"
  data-agent-id="agent-id"
  async>
</script>
```

Configure styling and behavior via the Settings service (`/v1/settings`) or by passing data attributes. See `website-widget.md` for customization details.

---

## Webhooks

Subscribe to platform events (lead creation, conversation updates, document ingestion, and more) via the webhook endpoints in the API. Each event payload includes metadata needed to reconcile with your CRM, ticketing system, or analytics stack.

Recommended flow:
1. Register a webhook endpoint using the API or SDK.
2. Verify shared secrets to authenticate callbacks.
3. Retry idempotently on failure (Knowrithm retries with exponential backoff).

See the [API Reference](../api-reference/README.md) section on webhooks for event types and payload schemas.

---

## REST API and Python SDK

Interact with the platform programmatically:

```python
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
)

conversation = client.conversations.create_conversation(agent_id="agent-id")
reply = client.messages.send_message(
    conversation_id=conversation["id"],
    message="Hello from our integration!"
)

print(reply["history"][-1]["assistant_response"])
```

Use scoped API keys for automated backends and pass JWT headers when acting on behalf of a user.

---

## Integration Patterns

### Customer Support Escalation
1. Widget forwards chat to an agent.
2. Agent triggers a webhook when escalation is needed.
3. Integration service creates a support ticket and notifies human agents.

### Lead Generation
1. Website visitors interact with a marketing agent.
2. Qualified leads trigger `lead.registered` webhooks.
3. CRM integration syncs leads and triggers follow-up sequences.

### Internal Enablement
1. Employees query a knowledge base agent.
2. Agent retrieves answers from documents and databases.
3. Responses are logged for analytics and continuous improvement.

---

## Coming Soon

- Native Slack, Teams, and Twilio connectors
- Zapier templates for no-code automation
- Turnkey CRM integrations (Salesforce, HubSpot)
- Customer support handoff (Zendesk, Intercom)

---

## Resources

- [Website Widget Guide](website-widget.md)
- [Webhooks Reference](../api-reference/README.md#dashboard-and-analytics-appblueprintsdashboardroutespy)
- [Python SDK Overview](../python-sdk/README.md)
- [Tutorial Examples](../tutorials/README.md)

For help, reach out via support@knowrithm.org or the community Discord.







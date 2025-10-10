# Lead Management

Leads represent prospects captured through agents, widgets, or API calls. The `KnowrithmClient.leads` service maps to `/v1/lead` routes and simplifies common CRM workflows.

---

## Create or Register Leads

```python
lead = client.leads.create_lead({
    "first_name": "Jordan",
    "last_name": "Lee",
    "email": "jordan@example.com",
    "phone": "+1-555-123-9000",
    "status": "new",
    "source": "website-chat",
    "agent_id": "agent-id"
})

print(lead["id"])
```

For public widgets use `register_lead`, which mirrors `POST /v1/lead/register` and does not require authentication.

---

## Retrieve and Update Leads

```python
record = client.leads.get_lead(lead["id"])

client.leads.update_lead(
    lead_id=record["id"],
    payload={"status": "qualified", "notes": "Requested enterprise demo"}
)
```

`update_lead` accepts any mutable fields defined in the REST schema, including consent flags and metadata.

---

## List Leads with Filters

```python
leads = client.leads.list_company_leads(
    status="new",
    search="example.com",
    page=1,
    per_page=25
)

for item in leads["items"]:
    print(item["email"], item["status"])
```

Query parameters support pagination, fuzzy search, and status filtering.

---

## Delete and Restore

```python
client.leads.delete_lead(lead["id"])
```

Lead deletion is soft; restore helpers are exposed via the REST API if needed for future workflows.

---

## Link Leads to Conversations

When a known lead engages an agent, create conversations using lead context:

```python
conversation = client.conversations.create_conversation(
    agent_id="agent-id",
    metadata={"lead_id": lead["id"]}
)
```

The platform enforces ownership and ensures conversation analytics attribute activity back to the correct lead.

---

## Analyze Lead Funnels

Combine lead data with analytics insights:

```python
report = client.analytics.get_lead_analytics(
    start_date="2025-09-01",
    end_date="2025-09-30"
)

print(report["conversion_funnel"]["overall_conversion_rate_percent"])
```

Exports (`export_analytics`) deliver CSV or JSON for downstream BI tooling.

---

## Tips

- Populate `source`, `notes`, and custom metadata to track acquisition channels.
- Subscribe to lead webhooks for real-time CRM synchronization.
- Use soft deletes to comply with data retention policies while allowing recovery.

See [api-reference/agents.md](../api-reference/companies.md) and [api-reference/analytics.md](../api-reference/analytics.md) for related endpoints.







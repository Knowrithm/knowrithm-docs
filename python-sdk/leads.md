# Lead Management

This guide covers how to use the `LeadService` to capture, track, and manage potential customers who interact with your AI agents.

---

## What is a Lead?

In Knowrithm, a lead is a specific type of entity representing a potential customer or prospect. By identifying a user as a lead, you can unlock powerful CRM-like features, including status tracking, conversion analytics, and targeted follow-ups.

### Lead Data Model

```json
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "source": "string",
  "status": "enum [new, contacted, qualified, converted, disqualified]",
  "company_id": "string",
  "created_at": "datetime",
  "notes": "string"
}
```

---

## Core Lead Operations

All lead management functions are accessed through the `LeadService`.

```python
from knowrithm_py.services.lead import LeadService

lead_service = LeadService(client)
```

### Creating a Lead

You can create a lead manually, for example, after capturing their details from a web form or a conversation.

```python
lead_data = {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "phone": "+1-555-123-4567",
    "source": "Website Chat Widget"
}

try:
    new_lead = lead_service.create(lead_data)
    lead_id = new_lead['id']
    print(f"Lead '{new_lead['first_name']}' created with ID: {lead_id}")
except Exception as e:
    print(f"Error creating lead: {e}")
```

### Listing and Filtering Leads

Retrieve a list of leads with powerful filtering options.

```python
# Get all new leads from the website
new_leads = lead_service.list(
    params={
        "status": "new",
        "source": "Website Chat Widget",
        "sort_by": "created_at",
        "sort_order": "desc"
    }
)

print(f"Found {len(new_leads)} new leads from the website.")
for lead in new_leads:
    print(f"- {lead['first_name']} {lead['last_name']} ({lead['email']})")
```

### Updating Lead Status and Notes

As you interact with a lead, you can update their status in the sales funnel and add notes.

```python
# Update the lead's status to 'qualified'
lead_service.update_status(
    lead_id=lead_id,
    status="qualified",
    notes="Customer showed strong interest in the Enterprise plan during the chat."
)

# Add additional notes later
lead_service.add_notes(
    lead_id=lead_id,
    notes="Follow-up call scheduled for Friday at 10 AM."
)

print(f"Lead {lead_id} status updated and notes added.")
```

### Getting and Updating Lead Details

Fetch a single lead's full details or update their information.

```python
# Get full details for a lead
lead_details = lead_service.get(lead_id)
print(f"Current status of {lead_details['email']}: {lead_details['status']}")

# Update the lead's contact information
updated_lead = lead_service.update(
    lead_id=lead_id,
    data={"phone": "+1-555-765-4321"}
)
```

---

## Connecting Leads to Conversations

To get the most out of lead management, associate conversations with a lead record. This allows you to track the full interaction history.

```python
from knowrithm_py.services.conversation import ConversationService

conversation_service = ConversationService(client)

# When a known lead starts a new chat, create the conversation like this:
lead_conversation = conversation_service.create(
    agent_id="your-agent-id",
    entity_type="LEAD",
    entity_id=lead_id # Associate with the existing lead
)

print(f"New conversation {lead_conversation['id']} started for lead {lead_id}.")
```

---

## Lead Analytics

Use the `AnalyticsService` to measure the effectiveness of your lead generation and conversion efforts.

```python
from knowrithm_py.services.analytics import AnalyticsService

analytics_service = AnalyticsService(client)

lead_analytics = analytics_service.get_lead_analytics(
    start_date="2024-01-01T00:00:00Z",
    end_date="2024-03-31T23:59:59Z"
)

funnel = lead_analytics['conversion_funnel']
print("--- Q1 Lead Conversion Funnel ---")
print(f"New Leads: {funnel['new']}")
print(f"Contacted: {funnel['contacted']}")
print(f"Qualified: {funnel['qualified']}")
print(f"Converted: {funnel['converted']}")
print(f"Overall Conversion Rate: {funnel['overall_conversion_rate_percent']:.2f}%")
```

---

## Best Practices

-   **Use Webhooks for CRM Sync**: Set up a webhook for the `lead.created` and `lead.status.updated` events to automatically sync lead data with your primary CRM (like Salesforce or HubSpot) in real-time.
-   **Define a Clear Funnel**: Standardize the `status` values you use (e.g., `new`, `contacted`, `demo-scheduled`, `qualified`, `converted`) to ensure your analytics are consistent and meaningful.
-   **Track Lead Sources**: Always populate the `source` field to understand which channels are generating the most valuable leads.
-   **Automate Follow-ups**: Use the `lead.created` webhook to trigger automated email sequences or assign tasks to your sales team.
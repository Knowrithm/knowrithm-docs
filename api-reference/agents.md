# Agents API

The Agents API allows you to create, configure, and manage your AI agents.

---

## Agent Data Model

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "personality": "string",
  "model_name": "string",
  "temperature": "number (0-1)",
  "max_response_length": "integer",
  "status": "enum [active, inactive, training]",
  "company_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "response_config": {
    "tone": "string",
    "include_sources": "boolean",
    "fallback_message": "string"
  }
}
```

---

## Core Endpoints

### Create Agent

`POST /agent`

Creates a new AI agent for the authenticated user's company.

**Request Body:**
```json
{
  "name": "Sales Assistant",
  "description": "AI assistant for sales inquiries",
  "personality": "Enthusiastic, persuasive, and knowledgeable about our products.",
  "model_name": "gpt-4",
  "temperature": 0.8
}
```

### List Agents

`GET /agent`

Retrieves a paginated list of all agents belonging to the company. Supports standard filtering and sorting parameters (e.g., `?status=active&search=Support`).

### Get Agent Details

`GET /agent/{agent_id}`

Retrieves the complete configuration for a single agent by its ID.

### Update Agent

`PUT /agent/{agent_id}`

Updates the configuration of an existing agent. You can modify its personality, model, or other settings.

### Delete Agent

`DELETE /agent/{agent_id}`

Soft-deletes an agent. The agent and its associated data can be recovered.

### Restore Agent

`PATCH /agent/{agent_id}/restore`

Restores a previously soft-deleted agent to an active state.
# Agents API

Manage agent records under `app/blueprints/agent/routes.py`. All endpoints require either `X-API-Key` + `X-API-Secret` (with appropriate scopes) or `Authorization: Bearer <JWT>` unless noted.

Base path: `/v1/agent`

---

## Endpoints

### Create Agent

- **POST `/v1/agent`**
- Headers: API key (`write`) or JWT
- Body fields: `name` (required), optional `description`, `status`, `avatar_url`, `llm_settings_id`, `personality_traits`, `capabilities`, `operating_hours`, `languages`
- Response: agent JSON

### List Agents

- **GET `/v1/agent`**
- Headers: API key (`read`) or JWT
- Query params: `company_id` (super admin), `status`, `search`, `page`, `per_page`
- Response: paginated list

### Get Agent

- **GET `/v1/agent/<agent_id>`**
- Headers: none (public route)
- Response: agent details

### Update Agent

- **PUT `/v1/agent/<agent_id>`**
- Headers: API key (`write`) or JWT
- Body: any updatable fields from creation payload
- Response: updated agent JSON

### Delete Agent

- **DELETE `/v1/agent/<agent_id>`**
- Headers: API key (`write`) or JWT
- Effect: soft delete

### Restore Agent

- **PATCH `/v1/agent/<agent_id>/restore`**
- Headers: same as delete
- Response: restored agent

### Embed Code

- **GET `/v1/agent/<agent_id>/embed-code`**
- Headers: API key (`read`) or JWT
- Response: widget script and configuration

### Test Agent

- **POST `/v1/agent/<agent_id>/test`**
- Headers: API key (`read`) or JWT
- Body: `{ "query": "optional prompt" }`
- Response: test completion payload

### Agent Stats

- **GET `/v1/agent/<agent_id>/stats`**
- Headers: API key (`read`) or JWT
- Response: aggregate counts and satisfaction metrics

### Clone Agent

- **POST `/v1/agent/<agent_id>/clone`**
- Headers: API key (`write`) or JWT
- Body: optional `name`, `llm_settings_id`
- Response: cloned agent record

---

## Widget and Test Utilities

- **GET `/widget.js`**: public widget script (no authentication)
- **POST `/test`**: render a test HTML snippet, typically used internally for debugging widgets

---

## Notes and Best Practices

- Soft deletes preserve configuration and attachments; use restore to recover.
- Associate LLM settings via `/v1/settings` to reuse provider credentials across agents.
- For tenant administration, super admins can list agents across companies by passing `company_id`.
- Monitor agent performance via the Analytics endpoints (`/v1/analytic/agent/<agent_id>`).







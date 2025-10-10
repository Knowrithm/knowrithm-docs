# API Reference

This document summarizes the available Flask blueprint routes, their primary request requirements, and the headers needed for authentication. Most write operations expect JSON payloads and should be sent with `Content-Type: application/json`. File uploads are explicitly labeled as multipart.

---

## API Overview

- **Base URL**: `https://app.knowrithm.org/api/v1`
- **Current Version**: `v1`
- All endpoints respond with JSON unless noted.
- Every service method in the Python SDK maps directly to these routes.

---

## Authentication Overview

- **JWT access tokens**: include `Authorization: Bearer <token>`. Role-specific decorators (admin, super admin, company, lead) still apply.
- **API key authentication**: provide both `X-API-Key` and `X-API-Secret`. Scopes such as `read`, `write`, or `admin` are enforced per endpoint.
- Unless a route explicitly states 'Headers: none', assume one of the above authentication methods is required. When both options are listed, either works.

---

## Address (`app/blueprints/address/routes.py`)

- `GET /v1/address-seed`
  - Purpose: populate countries, states, and cities with seed data.
  - Headers: none.
- `POST /v1/country`
  - Purpose: create a country.
  - Headers: `Authorization: Bearer <JWT>` (admin).
  - Body: `{ "name": string, "iso_code": string (optional) }`.
- `GET /v1/country`
  - Purpose: list countries.
  - Headers: none.
- `GET /v1/country/<country_id>`
  - Purpose: retrieve details and nested states.
  - Headers: none.
- `PATCH /v1/country/<country_id>`
  - Purpose: update country name or ISO code.
  - Headers: `Authorization: Bearer <JWT>` (admin).
  - Body: `{ "name": string (optional), "iso_code": string (optional) }`.
- `POST /v1/state`
  - Purpose: create a state.
  - Headers: `Authorization: Bearer <JWT>` (admin).
  - Body: `{ "name": string, "country_id": int }`.
- `GET /v1/state/country/<country_id>`
  - Purpose: list states for a country.
  - Headers: none.
- `GET /v1/state/<state_id>`
  - Purpose: retrieve state details with nested cities.
  - Headers: none.
- `PATCH /v1/state/<state_id>`
  - Purpose: update state name or country.
  - Headers: `Authorization: Bearer <JWT>` (admin).
  - Body: `{ "name": string (optional), "country_id": int (optional) }`.
- `POST /v1/city`
  - Purpose: create a city.
  - Headers: `Authorization: Bearer <JWT>` (admin).
  - Body: `{ "name": string, "state_id": int, "postal_code_prefix": string (optional) }`.
- `GET /v1/city/state/<state_id>`
  - Purpose: list cities in a state.
  - Headers: none.
- `GET /v1/city/<city_id>`
  - Purpose: retrieve city details.
  - Headers: none.
- `PATCH /v1/city/<city_id>`
  - Purpose: update city metadata.
  - Headers: `Authorization: Bearer <JWT>` (admin).
  - Body: `{ "name": string (optional), "state_id": int (optional), "postal_code_prefix": string (optional) }`.
- `POST /v1/address`
  - Purpose: create a company address.
  - Headers: `Authorization: Bearer <JWT>` (admin).
  - Body: fields include `street_address`, `city_id`, `state_id`, `country_id`, optional `lat`, `lan`, `postal_code`, `is_primary`.
- `GET /v1/address`
  - Purpose: retrieve the authenticated company address.
  - Headers: `Authorization: Bearer <JWT>`.

---

## Admin (`app/blueprints/admin/routes.py`)

- `GET /v1/admin/user` and `GET /v1/super-admin/company/<company_id>/user`
  - Purpose: list users with pagination and extensive filters.
  - Headers: API key (`admin` scope) or `Authorization: Bearer <JWT>` (admin or super admin).
  - Query options: pagination, `status`, `role`, `email_verified`, `two_factor_enabled`, `search`, `created_after`, `created_before`, `last_login_after`, `last_login_before`, `never_logged_in`, `locked`, `high_login_attempts`, `timezone`, `language`, `include_deleted`, `only_deleted`, `sort_by`, `sort_order`.
- `GET /v1/admin/user/<user_id>`
  - Purpose: retrieve a user in the current company.
  - Headers: same as above.
- `GET /v1/admin/system-metric` and `GET /v1/super-admin/company/<company_id>/system-metric`
  - Purpose: retrieve recent system metrics.
  - Headers: API key (`admin`) or `Authorization: Bearer <JWT>` (admin/super admin).
- `GET /v1/audit-log`
  - Purpose: list audit log entries.
  - Headers: API key (`admin`).
  - Query: `entity_type`, `event_type`, `risk_level`, `limit`, `offset`.
- `GET /v1/config`
  - Purpose: read configuration (sensitive keys hidden from non super admins).
  - Headers: API key (`admin`).
- `PATCH /v1/config`
  - Purpose: create or update a configuration entry.
  - Headers: API key (`admin`).
  - Body: `{ "config_key": string, "config_value": any, "config_type": string (optional), "description": string (optional), "is_sensitive": bool (optional) }`.
- `POST /v1/user/<user_id>/force-password-reset`
  - Purpose: force password reset and send an email.
  - Headers: API key (`admin`).
- `POST /v1/user/<user_id>/impersonate`
  - Purpose: impersonate a user (super admin only).
  - Headers: API key (`admin`, requester must be super admin).
- `PATCH /v1/user/<user_id>/status`
  - Purpose: change a user status.
  - Headers: API key (`admin`).
  - Body: `{ "status": string, "reason": string (optional) }`.
- `PATCH /v1/user/<user_id>/role`
  - Purpose: update a user role (super admin only).
  - Headers: API key (`admin`).
  - Body: `{ "role": string }`.

---

## Agent (`app/blueprints/agent/routes.py`)

- `POST /v1/agent`
  - Purpose: create an agent aligned with company or agent-level LLM settings.
  - Headers: API key (`write`) or JWT.
  - Body: JSON with required `name` and optional fields such as `description`, `avatar_url`, `llm_settings_id`, `personality_traits`, `capabilities`, `operating_hours`, `languages`, `status`.
- `GET /v1/agent/<agent_id>`
  - Purpose: retrieve agent details (public).
  - Headers: none.
- `GET /v1/agent`
  - Purpose: list company agents with filters.
  - Headers: API key (`read`) or JWT.
  - Query: `company_id` (super admin only), `status`, `search`, `page`, `per_page`.
- `PUT /v1/agent/<agent_id>`
  - Purpose: update agent metadata.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/agent/<agent_id>`
  - Purpose: soft delete an agent.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/agent/<agent_id>/restore`
  - Purpose: restore a deleted agent.
  - Headers: API key (`write`) or JWT.
- `GET /v1/agent/<agent_id>/embed-code`
  - Purpose: retrieve the embeddable widget script.
  - Headers: API key (`read`) or JWT.
- `POST /v1/agent/<agent_id>/test`
  - Purpose: run a test query against the agent.
  - Headers: API key (`read`) or JWT.
  - Body: `{ "query": string (optional) }`.
- `GET /v1/agent/<agent_id>/stats`
  - Purpose: retrieve aggregated agent metrics.
  - Headers: API key (`read`) or JWT.
- `POST /v1/agent/<agent_id>/clone`
  - Purpose: duplicate an agent configuration.
  - Headers: API key (`write`) or JWT.
  - Body: optional `name`, `llm_settings_id`.
- `GET /widget.js`
  - Purpose: fetch the public widget JavaScript.
  - Headers: none.
- `POST /test`
  - Purpose: render a test HTML snippet for the widget.
  - Headers: none.

---

## Auth (`app/blueprints/auth/routes.py`)

- `GET /v1/auth/super-admin`
  - Purpose: seed the platform super admin from environment variables.
  - Headers: none.
- `POST /v1/auth/register`
  - Purpose: register a new company admin.
  - Headers: none.
  - Body: `{ "company_id": uuid, "email": string, "username": string, "password": string, "first_name": string, "last_name": string }`.
- `POST /v1/auth/user`
  - Purpose: add a user under the authenticated company.
  - Headers: API key (`write`) or JWT (admin/super admin).
  - Body: includes user credentials; super admins may include `company_id`.
- `GET /v1/user/<user_id>`
  - Purpose: fetch a user within company scope.
  - Headers: API key (`read`) or JWT (admin).
- `POST /v1/auth/login`
  - Purpose: user login.
  - Headers: none.
- `GET /v1/auth/user/me`
  - Purpose: refresh current session and return profile and company.
  - Headers: API key (`read`) or JWT.
- `POST /v1/auth/logout`
  - Purpose: revoke the current session.
  - Headers: `Authorization: Bearer <JWT>`.
- `POST /v1/send`
  - Purpose: trigger verification email.
  - Headers: none.
  - Body: `{ "email": string }`.
- `POST /v1/verify`
  - Purpose: verify email ownership.
  - Headers: none.
  - Body: `{ "token": string }`.
- `POST /v1/auth/refresh`
  - Purpose: rotate access tokens using a refresh JWT.
  - Headers: `Authorization: Bearer <refresh JWT>`.

---

## Company (`app/blueprints/company/routes.py`)

- `GET /v1/super-admin/company`
  - Purpose: paginated company list for super admins.
  - Headers: `Authorization: Bearer <JWT>` (super admin).
- `GET /v1/company`
  - Purpose: retrieve the authenticated company.
  - Headers: API key (`read`) or JWT.
- `POST /v1/company`
  - Purpose: create a company via JSON or multipart form data.
  - Headers: context dependent (public onboarding or admin workflows).
- `GET /v1/company/<company_id>/statistics` and `GET /v1/company/statistics`
  - Purpose: retrieve lead statistics.
  - Headers: API key (`read`) or JWT.
- `DELETE /v1/company/<company_id>`
  - Purpose: soft delete a company.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/company/<company_id>/restore`
  - Purpose: restore a soft-deleted company.
  - Headers: API key (`write`) or JWT.
- `GET /v1/company/deleted`
  - Purpose: list soft-deleted companies.
  - Headers: API key (`read`) or JWT.
- `DELETE /v1/company/bulk-delete`
  - Purpose: bulk soft delete.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "company_ids": [uuid, ...] }`.
- `PATCH /v1/company/bulk-restore`
  - Purpose: bulk restore.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "company_ids": [uuid, ...] }`.
- `GET /v1/company/<company_id>/related-data`
  - Purpose: preview related entities prior to deletion (super admin).
  - Headers: `Authorization: Bearer <JWT>`.
- `DELETE /v1/company/<company_id>/cascade-delete`
  - Purpose: cascade soft delete with optional related data removal.
  - Headers: `Authorization: Bearer <JWT>`.
  - Body: `{ "delete_related": bool (optional) }`.
- `PUT /v1/company/<company_id>` and `PATCH /v1/company/<company_id>`
  - Purpose: update company metadata.
  - Headers: API key (`admin`) or JWT (admin/super admin).

---

## Conversation (`app/blueprints/conversation/routes.py`)

- `POST /v1/conversation`
  - Purpose: create a conversation linked to the authenticated entity.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "agent_id": uuid, "title": string (optional), "metadata": object (optional), "max_context_length": int (optional) }`.
- `GET /v1/conversation`
  - Purpose: list company conversations.
  - Headers: API key (`read`) or JWT.
  - Query: `page`, `per_page`.
- `GET /v1/conversation/entity`
  - Purpose: list conversations for the authenticated entity (user or lead).
  - Headers: API key (`read`) or JWT.
- `GET /v1/conversation/<conversation_id>/messages`
  - Purpose: fetch paginated messages for a conversation.
  - Headers: API key (`read`) or JWT.
- `POST /v1/conversation/<conversation_id>/chat`
  - Purpose: send a message and receive an AI response.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "message": string }`.
- `DELETE /v1/conversation/<conversation_id>`
  - Purpose: soft delete a conversation.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/conversation/<conversation_id>/messages`
  - Purpose: soft delete all messages for a conversation.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/conversation/<conversation_id>/restore`
  - Purpose: restore a conversation.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/conversation/<conversation_id>/message/restore-all`
  - Purpose: restore all messages in a conversation.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/message/<message_id>` and `PATCH /v1/message/<message_id>/restore`
  - Purpose: manage individual message lifecycle.
  - Headers: API key (`write`) or JWT.
- `GET /v1/conversation/deleted` and `GET /v1/message/deleted`
  - Purpose: list soft-deleted conversations or messages.
  - Headers: API key (`read`) or JWT.

---

## Dashboard and Analytics (`app/blueprints/dashboard/routes.py`)

- `GET /v1/analytic/dashboard`
  - Purpose: aggregate dashboard metrics.
  - Headers: API key (`read`) or JWT.
  - Query: optional `company_id` (super admin).
- `POST /v1/search/document`
  - Purpose: semantic document search.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "query": string, "agent_id": uuid, "limit": int (optional, max 50) }`.
- `POST /v1/search/database`
  - Purpose: semantic database search.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "query": string, "connection_id": uuid (optional) }`.
- `POST /v1/system-metric`
  - Purpose: trigger async system metric collection.
  - Headers: API key (`write`) or JWT.
- `GET /v1/analytic/agent/<agent_id>`
  - Purpose: detailed agent analytics.
  - Headers: API key (`read`) or JWT.
  - Query: `start_date`, `end_date`.
- `GET /v1/analytic/conversation/<conversation_id>`
  - Purpose: conversation analytics.
  - Headers: API key (`read`) or JWT.
- `GET /v1/analytic/leads`
  - Purpose: lead analytics.
  - Headers: API key (`read`) or JWT.
  - Query: `start_date`, `end_date`, optional `company_id`.
- `GET /v1/analytic/usage`
  - Purpose: usage metrics across the platform.
  - Headers: API key (`read`) or JWT.
- `GET /v1/analytic/agent/<agent_id>/performance-comparison`
  - Purpose: benchmark agent performance versus company averages.
  - Headers: API key (`read`) or JWT.
- `POST /v1/analytic/export`
  - Purpose: export analytics data (JSON or CSV).
  - Headers: API key (`read`) or JWT.
  - Body: `{ "type": "conversations"|"leads"|"agents"|"usage", "format": "json"|"csv", "start_date": iso (optional), "end_date": iso (optional) }`.

---

## Database (`app/blueprints/database/routes.py`)

- `POST /v1/database-connection`
  - Purpose: register and validate a database connection.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "name": string, "url": string, "database_type": string, "agent_id": uuid, "connection_params": object (optional) }`.
- `GET /v1/database-connection`
  - Purpose: list connections created by the authenticated user.
  - Headers: API key (`read`) or JWT.
- `POST /v1/database-connection/<connection_id>/test`
  - Purpose: retest a connection.
  - Headers: API key (`write`) or JWT.
- `POST /v1/database-connection/<connection_id>/analyze`
  - Purpose: queue semantic analysis for a connection.
  - Headers: API key (`write`) or JWT.
- `POST /v1/database-connection/analyze`
  - Purpose: batch analyze eligible connections.
  - Headers: API key (`write`) or JWT.
- `GET /v1/database-connection/<connection_id>/table`
  - Purpose: list captured tables.
  - Headers: API key (`read`) or JWT.
- `GET /v1/database-connection/table/<table_id>`
  - Purpose: retrieve table metadata.
  - Headers: API key (`read`) or JWT.
- `GET /v1/database-connection/<connection_id>/semantic-snapshot`
  - Purpose: fetch the semantic snapshot.
  - Headers: API key (`read`) or JWT.
- `GET /v1/database-connection/<connection_id>/knowledge-graph`
  - Purpose: retrieve the generated knowledge graph JSON.
  - Headers: API key (`read`) or JWT.
- `GET /v1/database-connection/<connection_id>/sample-queries`
  - Purpose: fetch AI-generated sample queries.
  - Headers: API key (`read`) or JWT.
- `POST /v1/database-connection/<connection_id>/text-to-sql`
  - Purpose: convert a question to SQL and optionally execute it.
  - Headers: API key (`read`) or JWT.
  - Body: `{ "question": string, "execute": bool (optional), "result_limit": int (optional) }`.
- `POST /v1/database-connection/export`
  - Purpose: export database tables into company documents.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "connection_id": uuid }`.
- `DELETE /v1/database-connection/<connection_id>`
  - Purpose: soft delete a connection.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/database-connection/table/<table_id>`
  - Purpose: remove a table metadata record.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/database-connection/<connection_id>/table`
  - Purpose: delete all tables associated with a connection.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/database-connection/<connection_id>/restore`
  - Purpose: restore a connection.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/database-connection/table/<table_id>/restore`
  - Purpose: restore a table metadata record.
  - Headers: API key (`write`) or JWT.
- `GET /v1/database-connection/deleted`
  - Purpose: list deleted connections.
  - Headers: API key (`read`) or JWT.
- `GET /v1/database-connection/table/deleted`
  - Purpose: list deleted tables.
  - Headers: API key (`read`) or JWT.
- `PUT /v1/database-connection/<connection_id>` and `PATCH /v1/database-connection/<connection_id>`
  - Purpose: update connection details (full or partial).
  - Headers: API key (`write`) or JWT.

---

## Document (`app/blueprints/document/routes.py`)

- `POST /v1/document/upload`
  - Purpose: upload documents (multipart) or scrape URLs (JSON).
  - Headers: API key (`write`) or JWT.
  - Body: must include `agent_id`. Accepts `files`, `url`, or `urls`.
- `GET /v1/document`
  - Purpose: list company documents.
  - Headers: API key (`read`) or JWT.
- `DELETE /v1/document/<document_id>`
  - Purpose: soft delete a document.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/document/<document_id>/restore`
  - Purpose: restore a document.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/document/chunk/<chunk_id>`
  - Purpose: soft delete a specific chunk.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/document/chunk/<chunk_id>/restore`
  - Purpose: restore a chunk.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/document/<document_id>/chunk`
  - Purpose: delete all chunks for a document.
  - Headers: API key (`write`) or JWT.
- `PATCH /v1/document/<document_id>/chunk/restore-all`
  - Purpose: restore every chunk for a document.
  - Headers: API key (`write`) or JWT.
- `GET /v1/document/deleted`
  - Purpose: list deleted documents.
  - Headers: API key (`read`) or JWT.
- `GET /v1/document/chunk/deleted`
  - Purpose: list deleted chunks.
  - Headers: API key (`read`) or JWT.
- `DELETE /v1/document/bulk-delete`
  - Purpose: bulk delete documents.
  - Headers: API key (`write`) or JWT.
  - Body: `{ "document_ids": [uuid, ...] }`.

---

## Health (`app/blueprints/health/routes.py`)

- `GET /health`
  - Purpose: simple health check.
  - Headers: none.

---

## Lead (`app/blueprints/lead/routes.py`)

- `POST /v1/lead/register`
  - Purpose: public widget endpoint for lead registration.
  - Headers: none.
  - Body: `{ "agent_id": uuid, "first_name": string, "last_name": string, "email": string, "phone": string (optional), "source": string (optional), "notes": string (optional), "consent_marketing": bool (optional), "consent_data_processing": bool (optional) }`.
- `POST /v1/lead`
  - Purpose: create a lead in authenticated context.
  - Headers: API key (`write`) or JWT.
- `GET /v1/lead/<lead_id>`
  - Purpose: fetch lead details.
  - Headers: API key (`read`) or JWT.
- `GET /v1/lead/company`
  - Purpose: list company leads with filters.
  - Headers: API key (`read`) or JWT.
  - Query: `page`, `per_page`, `status`, `search`.
- `PUT /v1/lead/<lead_id>`
  - Purpose: update lead attributes.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/lead/<lead_id>`
  - Purpose: soft delete a lead.
  - Headers: API key (`write`) or JWT.

---

## OAuth and API Keys (`app/blueprints/oauth/routes.py`)

- `POST /v1/auth/api-keys`
  - Purpose: create an API key for the current JWT user.
  - Headers: `Authorization: Bearer <JWT>`.
- `GET /v1/auth/api-keys`
  - Purpose: list active API keys.
  - Headers: `Authorization: Bearer <JWT>`.
- `DELETE /v1/auth/api-keys/<api_key_id>`
  - Purpose: revoke an API key.
  - Headers: `Authorization: Bearer <JWT>`.
- `GET /v1/auth/validate`
  - Purpose: validate current credentials.
  - Headers: `Authorization: Bearer <JWT>`.
- `GET /v1/overview`
  - Purpose: overview analytics for API keys.
  - Headers: API key (`read` + `admin`) or JWT (admin).
- `GET /v1/usage-trends`
  - Purpose: usage trend analytics.
  - Headers: API key (`read` + `admin`) or JWT (admin).
- `GET /v1/top-endpoints`
  - Purpose: most used endpoints.
  - Headers: API key (`read` + `admin`) or JWT (admin).
- `GET /v1/api-key-performance`
  - Purpose: per-key performance metrics.
  - Headers: API key (`read` + `admin`) or JWT (admin).
- `GET /v1/error-analysis`
  - Purpose: error distribution.
  - Headers: API key (`read` + `admin`) or JWT (admin).
- `GET /v1/rate-limit-analysis`
  - Purpose: rate limit utilization insights.
  - Headers: API key (`read` + `admin`) or JWT (admin).
- `GET /v1/detailed-usage/<api_key_id>`
  - Purpose: detailed usage logs for a key.
  - Headers: API key (`read` + `admin`) or JWT (admin).

---

## Profile (`app/blueprints/profile/routes.py`)

- `GET /v1/user/profile`
  - Purpose: retrieve the authenticated user profile.
  - Headers: API key (`read`) or JWT.
- `PUT /v1/user/profile`
  - Purpose: update profile fields.
  - Headers: API key (`write`) or JWT.
  - Body: optional subset of `{ "first_name", "last_name", "timezone", "language", "preferences" }`.

---

## Settings (`app/blueprints/settings/routes.py`)

- `POST /v1/settings`
  - Purpose: create LLM settings for a company or agent.
  - Headers: API key (`write`) or JWT.
  - Body: includes provider IDs, optional API keys, temperature, max tokens, widget configuration, `agent_id`, `is_default`.
- `PUT /v1/settings/<settings_id>`
  - Purpose: update settings.
  - Headers: API key (`write`) or JWT.
- `GET /v1/settings/<settings_id>`
  - Purpose: retrieve a settings record.
  - Headers: API key (`read`) or JWT.
- `GET /v1/settings/company/<company_id>` and `GET /v1/settings/agent/<agent_id>`
  - Purpose: list settings scoped to company or agent.
  - Headers: API key (`read`) or JWT.
- `DELETE /v1/settings/<settings_id>`
  - Purpose: delete settings.
  - Headers: API key (`write`) or JWT.
- `POST /v1/settings/test/<settings_id>`
  - Purpose: validate a configuration by performing a test call.
  - Headers: API key (`write`) or JWT.
- `POST /v1/providers`
  - Purpose: create a provider record.
  - Headers: API key (`write`) or JWT.
- `PUT /v1/providers/<provider_id>`
  - Purpose: update provider metadata.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/providers/<provider_id>`
  - Purpose: delete a provider.
  - Headers: API key (`write`) or JWT.
- `GET /v1/providers`
  - Purpose: list providers.
  - Headers: API key (`read`) or JWT.
- `GET /v1/providers/<provider_id>`
  - Purpose: retrieve provider details.
  - Headers: API key (`read`) or JWT.
- `POST /v1/providers/<provider_id>/models`
  - Purpose: create a provider model.
  - Headers: API key (`write`) or JWT.
- `PUT /v1/providers/<provider_id>/models/<model_id>`
  - Purpose: update a provider model.
  - Headers: API key (`write`) or JWT.
- `DELETE /v1/providers/<provider_id>/models/<model_id>`
  - Purpose: delete a provider model.
  - Headers: API key (`write`) or JWT.
- `GET /v1/providers/<provider_id>/models`
  - Purpose: list models for a provider.
  - Headers: API key (`read`) or JWT.
- `GET /v1/providers/<provider_id>/models/<model_id>`
  - Purpose: retrieve a single model.
  - Headers: API key (`read`) or JWT.
- `GET /v1/settings/providers`
  - Purpose: list providers with settings context.
  - Headers: API key (`read`) or JWT.
- `POST /v1/providers/bulk-import`
  - Purpose: bulk import providers and models.
  - Headers: API key (`write`) or JWT.
- `POST /v1/settings/providers/seed`
  - Purpose: seed default providers and models.
  - Headers: API key (`write`) or JWT.

---

## Utilities

- `GET /health`
  - Purpose: health and readiness probe.
  - Headers: none.

---

Refer to the Swagger documentation (`swagger_doc` directory) for detailed schemas, validation rules, and response examples. The Python SDK mirrors these endpoints one-to-one for convenience.







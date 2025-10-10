# Database Connections API

Database endpoints reside in `app/blueprints/database/routes.py`. They register external data sources, manage table metadata, and power semantic or text-to-SQL workflows. Authentication requires API keys (`read`/`write`) or JWTs.

Base path: `/v1/database-connection`

---

## Connections

### Create Connection

- **POST `/v1/database-connection`**
- Headers: API key (`write`) or JWT
- Body fields:
  - `name`: descriptive label
  - `url`: full connection string (`postgresql://user:pass@host:port/db`, etc.)
  - `database_type`: `postgres`, `mysql`, `sqlite`, `mongodb`
  - `agent_id`: UUID of the agent that should access this connection
  - `connection_params`: optional JSON overrides
- Response: connection record

### List Connections

- **GET `/v1/database-connection`**
- Headers: API key (`read`) or JWT
- Query: `page`, `per_page`, optional search filters

### Get Connection

- **GET `/v1/database-connection/<connection_id>`**
- Headers: API key (`read`) or JWT

### Update / Patch Connection

- **PUT `/v1/database-connection/<connection_id>`**
- **PATCH `/v1/database-connection/<connection_id>`**
- Headers: API key (`write`) or JWT
- Body: same fields as create (full or partial)

### Delete / Restore Connection

- **DELETE `/v1/database-connection/<connection_id>`** - soft delete
- **PATCH `/v1/database-connection/<connection_id>/restore`** - restore
- Headers: API key (`write`) or JWT

### Deleted Connections

- **GET `/v1/database-connection/deleted`**
- Headers: API key (`read`) or JWT
- Response: soft-deleted records

---

## Tables and Metadata

- **GET `/v1/database-connection/<connection_id>/table`** - list captured tables
- **GET `/v1/database-connection/table/<table_id>`** - retrieve table metadata
- **DELETE `/v1/database-connection/<connection_id>/table`** - delete all tables for a connection
- **DELETE `/v1/database-connection/table/<table_id>`** - delete single table metadata
- **PATCH `/v1/database-connection/table/<table_id>/restore`** - restore table metadata
- **GET `/v1/database-connection/table/deleted`** - list deleted tables

All routes require API key (`read`/`write`) or JWT.

---

## Analysis and Text-to-SQL

- **POST `/v1/database-connection/<connection_id>/test`** - re-test connectivity
- **POST `/v1/database-connection/<connection_id>/analyze`** - queue semantic/schema analysis
- **POST `/v1/database-connection/analyze`** - batch analysis for eligible connections
- **GET `/v1/database-connection/<connection_id>/semantic-snapshot`** - retrieve latest semantic snapshot
- **GET `/v1/database-connection/<connection_id>/knowledge-graph`** - fetch knowledge graph JSON
- **GET `/v1/database-connection/<connection_id>/sample-queries`** - sample NL-to-SQL prompts
- **POST `/v1/database-connection/<connection_id>/text-to-sql`**
  - Body: `question` (string), optional `execute` (bool), `result_limit` (int)
  - Response: generated SQL and optional execution results

---

## Exporting

- **POST `/v1/database-connection/export`**
  - Headers: API key (`write`) or JWT
  - Body: `{ "connection_id": "uuid" }`
  - Effect: converts database tables into company documents for ingestion

---

## Notes

- Store credentials in environment variables and inject them into the `url` field to avoid committing secrets.
- Run `test` and `analyze` whenever credentials or schema change to keep metadata fresh.
- Combine database search (`/v1/search/database`) with document search for unified answers across structured and unstructured data.







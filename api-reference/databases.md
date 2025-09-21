# Databases API

The Databases API allows you to connect external databases to your agents, enabling them to query for real-time information.

---

## Database Connection Model

```json
{
  "id": "string",
  "name": "string",
  "type": "enum [postgresql, mysql, sqlite, mongodb]",
  "host": "string",
  "port": "integer",
  "database": "string",
  "username": "string",
  "status": "enum [connected, disconnected, error]",
  "company_id": "string",
  "created_at": "datetime"
}
```

---

## Core Endpoints

### Add Database Connection

`POST /database-connection`

Adds and saves the connection details for an external database. The password is encrypted at rest.

**Request Body:**
```json
{
  "name": "Production Customer DB",
  "type": "postgresql",
  "host": "db.example.com",
  "port": 5432,
  "database": "customers",
  "username": "readonly_user",
  "password": "your_database_password"
}
```

### List Connections

`GET /database-connection`

Retrieves a list of all saved database connections for the company.

### Test Connection

`POST /database-connection/{connection_id}/test`

Tests the connectivity to a saved database connection to ensure the credentials and network access are correct.

### Analyze Database Schema

`POST /database-connection/{connection_id}/analyze`

Analyzes the schema of the connected database (tables, columns, relationships) to make it available for the agent to query. This is an asynchronous process.

### Search Across Databases

`POST /search/database`

Allows an agent to perform a natural language query that gets translated into an SQL query and executed against one or more connected databases.

**Request Body:**
```json
{
  "query": "Show me the total orders for customer 'john@example.com' in the last 30 days",
  "connection_ids": ["conn_123", "conn_456"]
}
```
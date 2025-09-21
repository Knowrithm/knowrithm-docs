# Companies API

The Companies API provides endpoints for creating and managing company accounts within the Knowrithm platform. These endpoints are typically restricted to super administrators.

---

## Company Data Model

```json
{
  "id": "string",
  "name": "string",
  "status": "enum [active, inactive, deleted]",
  "created_at": "datetime",
  "updated_at": "datetime",
  "settings": {
    "timezone": "string",
    "default_language": "string"
  }
}
```

---

## Core Endpoints

### Create Company

`POST /company`

Creates a new company account.

**Request Body:**
```json
{
  "name": "New Client Inc.",
  "admin_email": "admin@newclient.com",
  "admin_first_name": "Admin",
  "admin_last_name": "User"
}
```

### List Companies

`GET /company`

Retrieves a paginated list of all company accounts. Supports standard filtering and sorting parameters.

### Get Company Details

`GET /company/{company_id}`

Retrieves the details for a single company by its ID.

### Update Company

`PUT /company/{company_id}`

Updates the information for a specific company.

### Delete Company

`DELETE /company/{company_id}`

Soft-deletes a company. The company can be recovered using the restore endpoint.

---

## Company Statistics

### Get Company Statistics

`GET /company/{company_id}/statistics`

Retrieves key statistics for a company, such as the number of agents, total conversations, and lead conversion rates over a specified period.

**Query Parameters:**
- `days` (integer, default: 30): The number of past days to include in the statistics.
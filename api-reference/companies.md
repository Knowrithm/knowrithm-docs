# Companies API

Company management endpoints reside in `app/blueprints/company/routes.py`. They enable onboarding, lifecycle control, and statistics per tenant. Authentication requires API keys (scopes `read`, `write`, `admin`) or JWTs with matching roles.

Base path: `/v1/company`

---

## Endpoints

### Create Company

- **POST `/v1/company`**
- Headers: context dependent (often super admin during onboarding)
- Body: `name`, `email`, optional `logo`, `address_id`, `phone`
- Supports JSON or multipart form data for logo uploads

### Retrieve Current Company

- **GET `/v1/company`**
- Headers: API key (`read`) or JWT
- Returns the company associated with the authenticated credentials

### Company Statistics

- **GET `/v1/company/statistics`**
  - Headers: API key (`read`) or JWT
  - Query: `days` (default 30)
  - For super admins, pass `company_id` to target another tenant
- **GET `/v1/company/<company_id>/statistics`**
  - Same response scoped to the specified company ID

### Update Company

- **PUT `/v1/company/<company_id>`**
- **PATCH `/v1/company/<company_id>`**
- Headers: API key (`admin`) or JWT (admin/super admin)
- Body: any subset of `name`, `logo`, `address_id`, `email`, `phone`

### Delete / Restore Company

- **DELETE `/v1/company/<company_id>`** - soft delete
- **PATCH `/v1/company/<company_id>/restore`** - restore soft-deleted record
- Headers: API key (`write`) or JWT

### Deleted Companies

- **GET `/v1/company/deleted`**
- Headers: API key (`read`) or JWT
- Lists soft-deleted companies (paginated)

### Bulk Operations

- **DELETE `/v1/company/bulk-delete`**
  - Headers: API key (`write`) or JWT
  - Body: `{ "company_ids": ["uuid", ...] }`
- **PATCH `/v1/company/bulk-restore`**
  - Headers: API key (`write`) or JWT
  - Body: same structure

### Super Admin Routes

- **GET `/v1/super-admin/company`**
  - Headers: `Authorization: Bearer <JWT>` (super admin)
  - Query: `page`, `per_page`
- **GET `/v1/company/<company_id>/related-data`**
  - Headers: super admin JWT
  - Response: counts for dependent records (agents, leads, documents, etc.)
- **DELETE `/v1/company/<company_id>/cascade-delete`**
  - Headers: super admin JWT
  - Body: optional `{ "delete_related": true }` to cascade soft deletes

---

## Address Management

See [api-reference/documents.md](documents.md) for document endpoints and [api-reference/authentication.md](authentication.md) for user creation, which are typically used alongside company onboarding.

---

## Notes

- Soft deletes retain tenant data for audit purposes. Cascading delete should be used cautiously and typically only by super admins preparing for permanent removal.
- Apply consistent naming for `company_id` across API calls to avoid cross-tenant access issues.
- When combining with analytics, pass the `company_id` query parameter to scope dashboards and reports.







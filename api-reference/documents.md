# Documents API

Document ingestion endpoints are defined in `app/blueprints/document/routes.py`. They support file uploads, URL ingestion, chunk management, and soft deletion. Authentication requires API keys (`read`/`write`) or JWTs.

Base path: `/v1/document`

---

## Upload

- **POST `/v1/document/upload`**
  - Headers: API key (`write`) or JWT
  - Content type:
    - `multipart/form-data` for file uploads (`file` or `files[]`)
    - `application/json` for URL ingestion (`url` or `urls`)
  - Required field: `agent_id`
  - Optional: `metadata` (JSON), `metadata[...]` when using multipart
  - Response: upload job details with document IDs

---

## Listing

- **GET `/v1/document`**
  - Headers: API key (`read`) or JWT
  - Query parameters: `agent_id`, `status`, `page`, `per_page`
- **GET `/v1/document/deleted`**
  - Headers: API key (`read`) or JWT
  - Lists soft-deleted documents

---

## Document Lifecycle

- **DELETE `/v1/document/<document_id>`** - soft delete
- **PATCH `/v1/document/<document_id>/restore`** - restore
- Headers: API key (`write`) or JWT

Bulk operations:
- **DELETE `/v1/document/bulk-delete`**
  - Body: `{ "document_ids": ["uuid", ...] }`
  - Headers: API key (`write`) or JWT

---

## Chunk Management

- **DELETE `/v1/document/<document_id>/chunk`** - delete all chunks for a document
- **PATCH `/v1/document/<document_id>/chunk/restore-all`** - restore all chunks
- **DELETE `/v1/document/chunk/<chunk_id>`** - delete single chunk
- **PATCH `/v1/document/chunk/<chunk_id>/restore`** - restore single chunk
- **GET `/v1/document/chunk/deleted`** - list deleted chunks

All chunk routes require API key (`write`) or JWT.

---

## Search (Analytics Blueprint)

Semantic search lives under the analytics blueprint:

- **POST `/v1/search/document`**
  - Headers: API key (`write`) or JWT
  - Body: `query` (string), `agent_id` (UUID), optional `limit` (max 50)
  - Response: list of matches with scores, content snippets, and source metadata

---

## Notes

- Uploads are asynchronous; check document listings to verify status transitions (`queued`, `processing`, `processed`, `failed`).
- Use metadata to tag documents with versioning, locales, or business domains.
- All deletes are soft by default, ensuring auditability and quick restoration.
- Combine document ingestion with database exports (`/v1/database-connection/export`) for comprehensive knowledge bases.







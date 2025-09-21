# Documents API

The Documents API is used to upload, manage, and search the knowledge base content that trains your AI agents.

---

## Document Data Model

```json
{
  "id": "string",
  "filename": "string",
  "file_size": "integer",
  "file_type": "string",
  "agent_id": "string",
  "status": "enum [processing, completed, failed]",
  "processing_progress": "integer (0-100)",
  "chunk_count": "integer",
  "uploaded_at": "datetime",
  "processed_at": "datetime",
  "metadata": "object"
}
```

---

## Core Endpoints

### Upload Document

`POST /document/upload`

Uploads a document for processing and associates it with an agent. This is a `multipart/form-data` request.

**Form Data:**
-   `file`: The document file to upload.
-   `agent_id`: The ID of the agent to train with this document.
-   `metadata` (optional, JSON string): Custom key-value data to store with the document.

### List Documents

`GET /document`

Retrieves a paginated list of documents. Can be filtered by `agent_id` and `status`.

### Search Within Documents

`POST /search/document`

Performs a semantic search across the processed documents for one or more agents.

**Request Body:**
```json
{
  "query": "What is the refund policy?",
  "filters": {
    "agent_id": "agent_123"
  },
  "limit": 5
}
```

### Get Processing Status

`GET /document/{document_id}/status`

Checks the current processing status of a document after it has been uploaded.

### Delete Document

`DELETE /document/{document_id}`

Soft-deletes a document and its associated chunks from the knowledge base.

### Reprocess Document

`POST /document/{document_id}/reprocess`

Triggers a reprocessing of an already uploaded document. This is useful if the document content has changed or if the processing engine has been updated.
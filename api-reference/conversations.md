# Conversations API

Conversation and message routes are defined in `app/blueprints/conversation/routes.py`. They control session lifecycle, history retrieval, and soft deletion. Authentication requires API keys (`read`/`write`) or JWTs.

Base paths:
- Conversations: `/v1/conversation`
- Messages: `/v1/message`

---

## Conversations

### Create Conversation

- **POST `/v1/conversation`**
- Headers: API key (`write`) or JWT
- Body:
  ```json
  {
    "agent_id": "uuid",
    "title": "optional",
    "metadata": { "source": "widget" },
    "max_context_length": 20
  }
  ```
- Response: conversation object linked to the authenticated entity

### List Conversations

- **GET `/v1/conversation`**
- Headers: API key (`read`) or JWT
- Query: `page`, `per_page`
- Response: paginated list scoped to the company

### List Conversations for Current Entity

- **GET `/v1/conversation/entity`**
- Headers: API key (`read`) or JWT
- Returns conversations associated with the authenticated user or lead

### Retrieve Messages

- **GET `/v1/conversation/<conversation_id>/messages`**
- Headers: API key (`read`) or JWT
- Query: `page`, `per_page`
- Response: paginated message history

### Send Message

- **POST `/v1/conversation/<conversation_id>/chat`**
- Headers: API key (`write`) or JWT
- Body: `{ "message": "user content" }`
- Response: conversation history including agent reply

### Delete / Restore Conversation

- **DELETE `/v1/conversation/<conversation_id>`**
- **PATCH `/v1/conversation/<conversation_id>/restore`**
- Headers: API key (`write`) or JWT
- Effect: soft delete / restore entire conversation

### Delete / Restore All Messages in Conversation

- **DELETE `/v1/conversation/<conversation_id>/messages`**
- **PATCH `/v1/conversation/<conversation_id>/message/restore-all`**
- Headers: API key (`write`) or JWT
- Use for bulk removal or recovery

### Deleted Conversations

- **GET `/v1/conversation/deleted`**
- Headers: API key (`read`) or JWT
- Lists soft-deleted conversations

---

## Messages

### Delete Message

- **DELETE `/v1/message/<message_id>`**
- Headers: API key (`write`) or JWT
- Soft deletes a single message

### Restore Message

- **PATCH `/v1/message/<message_id>/restore`**
- Headers: API key (`write`) or JWT
- Restores a soft-deleted message

### Deleted Messages

- **GET `/v1/message/deleted`**
- Headers: API key (`read`) or JWT
- Paginated list of deleted messages

---

## Notes

- Agent responses are returned synchronously via `/chat`. Streaming is handled at the transport layer.
- Metadata fields accept arbitrary JSON for custom tags or CRM identifiers.
- Soft delete endpoints enable compliance workflows by retaining audit trails.
- Combine these endpoints with Analytics (`/v1/analytic/conversation/<conversation_id>`) for insights into conversation quality and flow.







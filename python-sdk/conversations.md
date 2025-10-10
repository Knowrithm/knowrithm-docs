# Conversations and Messages

Conversations track multi-turn exchanges between an entity (user or lead) and an agent. Use `KnowrithmClient.conversations` for conversation lifecycle operations and `KnowrithmClient.messages` to send or manage individual messages.

---

## Start a Conversation

```python
conversation = client.conversations.create_conversation(
    agent_id="agent-id",
    title="Website widget session",
    metadata={"source": "pricing-page"}
)

print(conversation["id"])
```

Parameters mirror `POST /v1/conversation`:
- `agent_id` (required)
- Optional `title`, `metadata` (dict), `max_context_length`

The authenticated context (API key or JWT) determines the entity that owns the conversation.

---

## Send Messages

```python
reply = client.messages.send_message(
    conversation_id=conversation["id"],
    message="Hello! Can you explain the enterprise plan?"
)

last_turn = reply["history"][-1]
print(last_turn["assistant_response"])
```

`send_message` returns the persisted history including the agent response. Provide the optional `headers` keyword to override authentication per call.

---

## Fetch History

```python
messages = client.conversations.list_conversation_messages(
    conversation_id=conversation["id"],
    page=1,
    per_page=20
)

for item in messages["items"]:
    print(item["role"], item["content"])
```

Pagination parameters forward to `GET /v1/conversation/<id>/messages`.

---

## Manage Lifecycles

```python
# List active conversations
active = client.conversations.list_conversations(page=1, per_page=10)

# Soft delete / restore
client.conversations.delete_conversation(conversation["id"])
client.conversations.restore_conversation(conversation["id"])

# Delete or restore messages
client.messages.delete_message("message-id")
client.messages.restore_message("message-id")
```

Bulk message removal is available through `delete_conversation_messages` and `restore_all_messages`.

---

## Streaming Support

The current SDK exposes synchronous helpers. For UI streaming, call the REST `/v1/conversation/<conversation_id>/chat` endpoint directly and stream the HTTP response with your preferred HTTP client.

---

## Conversation Analytics

Combine conversation data with analytics insights:

```python
analytics = client.analytics.get_conversation_analytics(conversation["id"])
print(analytics["message_statistics"]["agent_message_count"])
```

This requires either `X-API-Key` scopes (`read`) or an admin JWT.

---

## Tips

- Attach metadata (such as CRM IDs) to conversations for later reconciliation.
- Use `client.conversations.list_conversations_for_entity` when building user-facing dashboards.
- Soft deletes preserve audit trails; restore operations are idempotent.
- After deleting conversations, run analytics exports to maintain records outside the platform if required by retention policies.

Refer to the [API conversations reference](../api-reference/conversations.md) for the full list of query parameters and response fields.







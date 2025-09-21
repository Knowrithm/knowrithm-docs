# Conversations API 💬

The Conversations API is used to manage chat sessions and the messages within them.

---

## Conversation Data Model

```json
{
  "id": "string",
  "agent_id": "string", 
  "entity_type": "enum [USER, LEAD]",
  "status": "enum [active, ended, archived]",
  "lead_id": "string",
  "message_count": "integer",
  "started_at": "datetime",
  "ended_at": "datetime",
  "rating": "integer (1-5)",
  "metadata": "object"
}
```

---

## Conversation Endpoints

### Start a New Conversation

`POST /conversation`

Initiates a new conversation with a specified agent.

**Request Body:**
```json
{
  "agent_id": "agent_123",
  "entity_type": "USER",
  "metadata": {
    "source": "website_widget",
    "page_url": "/pricing"
  }
}
```

### List Conversations

`GET /conversation`

Retrieves a paginated list of conversations. Can be filtered by `agent_id`, `status`, etc.

### End a Conversation

`POST /conversation/{conversation_id}/end`

Marks a conversation as `ended` and allows for an overall rating to be submitted.

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "The agent was very helpful!"
}
```

---

## Message Endpoints

### Send a Message

`POST /conversation/{conversation_id}/chat`

Sends a message from a user to the agent within a specific conversation and returns the agent's response. This is the primary endpoint for interaction.

**Request Body:**
```json
{
  "content": "I need help with my recent order.",
  "role": "user"
}
```

For real-time applications, you can enable streaming by setting `"stream": true` in the request body. See the main API reference for a detailed example.

### Get Conversation History

`GET /conversation/{conversation_id}/messages`

Retrieves a paginated list of all messages within a single conversation.

### Rate a Message

`POST /message/{message_id}/rate`

Allows a user to rate a specific agent message (e.g., with a thumbs up/down).
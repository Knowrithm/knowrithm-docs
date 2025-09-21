# Conversation Management

This guide covers how to manage conversations with your AI agents using the Knowrithm Python SDK. Conversations are the stateful, contextual interactions between a user (or lead) and an agent.

## What is a Conversation?

A conversation is a sequence of messages exchanged with an agent. The Knowrithm platform automatically manages the context and history, allowing for natural, multi-turn dialogues.

### Core Concepts
- **Lifecycle**: A conversation can be `active`, `ended`, or `archived`.
- **Entities**: Conversations are associated with an `entity_type`, which can be a `USER` (a general user) or a `LEAD` (a tracked prospect).
- **Context**: Each conversation maintains its own context. An agent's responses are based on the history of the current conversation.
- **Metadata**: You can attach custom key-value data to a conversation for tracking, analytics, or integration purposes.

---

## Starting a Conversation

Use the `ConversationService` to initiate a new chat session.

```python
from knowrithm_py.services.conversation import ConversationService

conversation_service = ConversationService(client)

# Start a new conversation with a specific agent
conversation = conversation_service.create(
    agent_id="your-agent-id",
    entity_type="USER", # Can be "USER" or "LEAD"
    metadata={
        "source": "website_widget",
        "page": "/pricing",
        "internal_user_id": "user-xyz-789"
    }
)

conversation_id = conversation['id']
print(f"Conversation started with ID: {conversation_id}")
```

---

## • Sending and Receiving Messages

Use the `MessageService` for all message-related operations within a conversation.

### Sending a Message

Send a user's message to the agent and receive a response.

```python
from knowrithm_py.services.message import MessageService

message_service = MessageService(client)

# Send a message from the user
user_message = "What's the difference between the Pro and Enterprise plans?"

response = message_service.send_message(
    conversation_id=conversation_id,
    content=user_message,
    role="user"
)

print(f"User: {user_message}")
print(f"Agent: {response['content']}")
```

### Listing Conversation History

Retrieve all messages exchanged in a conversation.

```python
messages = message_service.list_messages(conversation_id)

print(f"--- Conversation History (ID: {conversation_id}) ---")
for message in messages:
    role_icon = "👤" if message['role'] == 'user' else "🤖"
    print(f"{role_icon} ({message['role']}): {message['content']}")
print("----------------------------------------------------")
```

### Rating a Message

Collect feedback on the quality of an agent's response. This data is used in analytics to measure agent performance.

```python
# Assume 'response' is the message dictionary returned from send_message
message_id_to_rate = response['id']

# Rate the message on a scale of 1-5
rating_response = message_service.rate_message(
    message_id=message_id_to_rate,
    rating=5, # 5 for excellent
    feedback="This was a very clear and helpful answer."
)

print("Feedback submitted. Thank you!")
```

---

## Streaming Responses

For real-time applications like a chat widget, you can stream the agent's response as it's being generated. This provides a much better user experience than waiting for the full response.

```python
def stream_agent_response(conversation_id, user_message):
    """
    Sends a message and streams the agent's response chunk by chunk.
    """
    print(f"You: {user_message}")
    print("Agent: ", end="", flush=True)
    
    full_response_content = ""
    
    try:
        # The send_message_stream method returns a generator
        stream = message_service.send_message_stream(
            conversation_id=conversation_id,
            content=user_message,
            role="user"
        )

        for chunk in stream:
            # Each chunk is a dictionary, potentially containing a piece of the content
            content_piece = chunk.get("content", "")
            if content_piece:
                print(content_piece, end="", flush=True)
                full_response_content += content_piece
        
        print() # Newline after the full response is streamed
        return full_response_content

    except Exception as e:
        print(f"\nError during streaming: {e}")
        return None

# Example usage
# stream_agent_response(conversation_id, "Tell me a long story about AI.")
```

---

## ⚙️ Managing Conversation Sessions

### Listing Conversations

Retrieve a list of conversations, with options for filtering.

```python
# Get the 10 most recent active conversations for an agent
active_conversations = conversation_service.list(
    params={
        "agent_id": "your-agent-id",
        "status": "active",
        "sort_by": "started_at",
        "sort_order": "desc",
        "per_page": 10
    }
)

print(f"Found {len(active_conversations)} active conversations.")
```

### Ending a Conversation

Mark a conversation as `ended`. This is useful for session management and analytics.

```python
# End the conversation and provide an overall satisfaction rating
ended_conversation = conversation_service.end_conversation(
    conversation_id=conversation_id,
    rating=4, # Overall rating for the conversation
    feedback="The agent was helpful but a bit slow."
)

print(f"Conversation {conversation_id} has been ended.")
```

### Updating Conversation Metadata

You can add or modify the metadata associated with a conversation at any time.

```python
# After a user logs in, update the conversation with their user ID
updated_conversation = conversation_service.update(
    conversation_id=conversation_id,
    metadata={
        "internal_user_id": "user-xyz-789",
        "user_plan": "premium"
    }
)
print("Conversation metadata updated.")
```

---

## Conversation Analytics

Get detailed analytics for a single conversation to understand its flow and effectiveness.

```python
from knowrithm_py.services.analytics import AnalyticsService

analytics_service = AnalyticsService(client)

conv_analytics = analytics_service.get_conversation_analytics(conversation_id)

print(f"Total Messages: {conv_analytics['message_statistics']['total_messages']}")
print(f"Duration: {conv_analytics['conversation_flow']['duration_minutes']:.2f} minutes")
print(f"User Satisfaction: {conv_analytics['quality_metrics']['satisfaction_rating']}/5.0")
```

---

## Best Practices

- **Use Metadata**: Store important session information (like user IDs, session IDs from your application, or tracking tags) in the conversation metadata. This is invaluable for analytics and debugging.
- **Manage Conversation Lifecycle**: Explicitly end conversations when a user's session ends. This keeps your analytics clean and helps manage resources.
- **Use Streaming for UI**: For any user-facing chat interface, always use the streaming endpoint (`send_message_stream`) to provide instant feedback.
- **Handle Conversation Timeouts**: In your application, decide on a timeout period (e.g., 30 minutes of inactivity) after which you automatically end a conversation via the API.

---

## Full Example

This script demonstrates a complete, interactive chat session.

```python
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.services.conversation import ConversationService
from knowrithm_py.services.message import MessageService

def interactive_chat_session(client, agent_id):
    """Runs a full interactive chat session."""
    conversation_service = ConversationService(client)
    message_service = MessageService(client)

    # 1. Start conversation
    print("Starting a new conversation...")
    conversation = conversation_service.create(agent_id=agent_id, entity_type="USER")
    conversation_id = conversation['id']
    print(f"Conversation started (ID: {conversation_id}). Type 'quit' to end.")

    # 2. Chat loop
    while True:
        user_input = input("\n👤 You: ").strip()

        if user_input.lower() in ['quit', 'exit', 'bye']:
            break
        
        if not user_input:
            continue

        # 3. Send message and stream response
        print("Agent: ", end="", flush=True)
        try:
            stream = message_service.send_message_stream(
                conversation_id=conversation_id,
                content=user_input,
                role="user"
            )
            for chunk in stream:
                print(chunk.get("content", ""), end="", flush=True)
            print() # Final newline
        except Exception as e:
            print(f"\nError sending message: {e}")

    # 4. End conversation
    print("\nEnding conversation...")
    try:
        rating = int(input("Rate this conversation (1-5): "))
    except ValueError:
        rating = None
        
    conversation_service.end_conversation(conversation_id, rating=rating)
    print("Conversation ended. Thank you!")

# Assuming 'client' is initialized and you have an 'agent_id'
# interactive_chat_session(client, "your-agent-id")
```
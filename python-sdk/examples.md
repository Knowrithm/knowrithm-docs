# Code Examples & Recipes 💡

This page contains a collection of practical, ready-to-use code examples and recipes for common tasks you'll perform with the Knowrithm Python SDK.

---

## 🤖 Agent Management

### Create an Agent with Advanced Configuration

This example shows how to create an agent with a detailed system prompt, a specific AI model, and response configurations.

```python
from knowrithm_py.services.agent import AgentService

agent_service = AgentService(client)

agent_config = {
    "name": "Proactive Sales Assistant",
    "description": "Engages website visitors to qualify leads and drive sales.",
    "personality": "Enthusiastic, persuasive, and knowledgeable about our products.",
    "model_name": "gpt-4",
    "temperature": 0.8,
    "max_response_length": 400,
    "system_prompt": "You are a top-performing sales development representative. Your goal is to understand the customer's needs, recommend the best products, and encourage them to sign up for a demo.",
    "response_config": {
        "tone": "persuasive",
        "include_sources": False,
        "fallback_message": "That's a great question. Let me connect you with a sales expert who can provide more details."
    }
}

try:
    agent = agent_service.create(agent_config)
    print(f"✅ Advanced agent '{agent['name']}' created with ID: {agent['id']}")
except Exception as e:
    print(f"❌ Error creating agent: {e}")
```

### Find an Agent by Name

This recipe shows how to find a specific agent by its name, since the `list` method supports search.

```python
def find_agent_by_name(agent_name: str):
    """Finds the first agent that matches the given name."""
    agents = agent_service.list(params={"search": agent_name, "per_page": 1})
    if agents:
        # Verify the name matches exactly if needed
        if agents[0]['name'] == agent_name:
            return agents[0]
    return None

# Usage
support_agent = find_agent_by_name("Friendly Support Bot")
if support_agent:
    print(f"Found agent with ID: {support_agent['id']}")
else:
    print("Agent not found.")
```

---

## 💬 Conversation Handling

### Interactive Chat Loop with Streaming

This provides a complete, interactive command-line chat experience that streams the agent's response in real-time.

```python
from knowrithm_py.services.conversation import ConversationService, MessageService

def interactive_chat_session(agent_id: str):
    """Runs a full interactive chat session with streaming."""
    conversation_service = ConversationService(client)
    message_service = MessageService(client)

    print("Starting a new conversation...")
    conversation = conversation_service.create(agent_id=agent_id, entity_type="USER")
    conversation_id = conversation['id']
    print(f"✅ Conversation started (ID: {conversation_id}). Type 'quit' to end.")

    while True:
        try:
            user_input = input("\n👤 You: ").strip()
            if user_input.lower() in ['quit', 'exit', 'bye']:
                break
            
            print("🤖 Agent: ", end="", flush=True)
            stream = message_service.send_message_stream(
                conversation_id=conversation_id,
                content=user_input,
                role="user"
            )
            for chunk in stream:
                print(chunk.get("content", ""), end="", flush=True)
            print() # Final newline

        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

    print("\nEnding conversation...")
    conversation_service.end_conversation(conversation_id)
    print("✅ Session ended.")

# Usage
# interactive_chat_session("your-agent-id")
```

### Using a Context Manager for Conversations

This pattern ensures that a conversation is always properly ended, even if errors occur.

```python
from contextlib import contextmanager

@contextmanager
def conversation_context(agent_id: str):
    """A context manager to automatically start and end a conversation."""
    conversation_service = ConversationService(client)
    conversation = conversation_service.create(agent_id=agent_id, entity_type="USER")
    print(f"Entering conversation {conversation['id']}...")
    try:
        yield conversation
    finally:
        print(f"Exiting and ending conversation {conversation['id']}...")
        conversation_service.end_conversation(conversation['id'])

# Usage
with conversation_context("your-agent-id") as conv:
    message_service = MessageService(client)
    response = message_service.send_message(
        conversation_id=conv['id'],
        content="This is a test inside a context manager.",
        role="user"
    )
    print(f"Agent response: {response['content']}")
```

---

## 📚 Document & Data Processing

### Upload and Poll for Completion

This recipe uploads a document and then polls the API until the processing is complete.

```python
import time
from knowrithm_py.services.document import DocumentService

def upload_and_wait(file_path: str, agent_id: str, timeout_seconds: int = 180):
    """Uploads a document and waits for it to finish processing."""
    document_service = DocumentService(client)
    
    print(f"Uploading '{file_path}'...")
    doc = document_service.upload(file_path=file_path, agent_id=agent_id)
    doc_id = doc['id']
    
    start_time = time.time()
    while time.time() - start_time < timeout_seconds:
        status_res = document_service.get_processing_status(doc_id)
        status = status_res.get('status')
        if status == 'completed':
            print("✅ Processing complete!")
            return True
        if status == 'failed':
            print(f"❌ Processing failed: {status_res.get('error_message')}")
            return False
        print(f"⏳ Status: {status}...")
        time.sleep(10)
        
    print("⌛️ Processing timed out.")
    return False

# Usage
# upload_and_wait("./docs/manual.pdf", "your-agent-id")
```

---

## 📊 Analytics & Reporting

### Generate a Weekly Performance Report

This script fetches key metrics for an agent over the last week and prints a summary.

```python
from datetime import datetime, timedelta
from knowrithm_py.services.analytics import AnalyticsService

def generate_weekly_report(agent_id: str):
    """Generates and prints a weekly performance report for an agent."""
    analytics_service = AnalyticsService(client)
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    print(f"--- Weekly Report for Agent {agent_id} ---")
    print(f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}\n")
    
    try:
        metrics = analytics_service.get_agent_metrics(
            agent_id=agent_id,
            start_date=start_date.isoformat() + "Z",
            end_date=end_date.isoformat() + "Z"
        )
        
        conv_metrics = metrics['conversation_metrics']
        quality_metrics = metrics['quality_metrics']
        
        print(f"Total Conversations: {conv_metrics['total_conversations']}")
        print(f"Avg. Satisfaction: {quality_metrics['avg_satisfaction_rating']:.2f}/5.0")
        print(f"Avg. Messages per Conversation: {conv_metrics['avg_messages_per_conversation']:.1f}")
        
    except Exception as e:
        print(f"❌ Could not generate report: {e}")

# Usage
# generate_weekly_report("your-agent-id")
```

### Export Data to CSV

This example exports all leads from the last month into a CSV file.

```python
import csv
import io

def export_leads_to_csv(filename="leads_export.csv"):
    """Exports lead data to a CSV file."""
    analytics_service = AnalyticsService(client)
    
    export_request = {
        "type": "leads",
        "format": "csv",
        "start_date": "2024-01-01T00:00:00Z", # Use a dynamic date range
        "end_date": "2024-12-31T23:59:59Z"
    }
    
    response = analytics_service.export_analytics_data(export_request)
    
    if 'data' in response:
        with open(filename, "w", newline="", encoding="utf-8") as f:
            f.write(response['data'])
        print(f"✅ Lead data successfully exported to {filename}")
    else:
        print("❌ No data returned for export.")

# Usage
# export_leads_to_csv()
```
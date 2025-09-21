# Knowrithm Python SDK 🐍 [![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/downloads/) [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE) [![PyPI version](https://badge.fury.io/py/knowrithm-py.svg)](https://badge.fury.io/py/knowrithm-py)

The Knowrithm Python SDK provides a comprehensive interface for building, training, and deploying intelligent AI agents. This powerful SDK enables you to create custom chatbots, process documents, manage conversations, and access detailed analytics—all with just a few lines of Python code.

---

## 🎯 SDK Overview

Knowrithm enables businesses to:

- **Build Custom AI Agents**: Create specialized chatbots tailored to your business needs
- **Process & Analyze Documents**: Upload and analyze various document types for knowledge extraction
- **Manage Leads**: Track and convert leads through intelligent conversation flows
- **Monitor Performance**: Comprehensive analytics for agents, conversations, and business metrics
- **Scale Operations**: Handle multiple conversations simultaneously with detailed monitoring

{% hint style="success" %}
**Perfect for:** Developers, data scientists, and businesses looking to integrate AI agents into their applications with minimal setup time.
{% endhint %}

---

## 📦 Installation

{% tabs %}
{% tab title="pip (Recommended)" %}
```bash
pip install knowrithm-py
```
{% endtab %}

{% tab title="Poetry" %}
```bash
poetry add knowrithm-py
```
{% endtab %}

{% tab title="From Source" %}
```bash
git clone https://github.com/Knowrithm/knowrithm-py.git
cd knowrithm-py
pip install -e .
```
{% endtab %}

{% tab title="Conda" %}
```bash
conda install -c conda-forge knowrithm-py
```
{% endtab %}
{% endtabs %}

**Requirements:**
- Python 3.8 or higher
- Internet connection for API access

---

## ⚡ Quick Start

Get up and running in under 2 minutes:

```python
from knowrithm_py.client import KnowrithmClient

# Initialize the client
client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret",
    base_url="https://app.knowrithm.org"
)

# Create an AI agent
agent = client.agents.create({
    "name": "Customer Support Bot",
    "description": "Helpful customer service assistant",
    "personality": "friendly and professional",
    "model_name": "gpt-4",
    "max_response_length": 500
})

# Start a conversation
conversation = client.conversations.create(
    agent_id=agent['id'],
    entity_type="USER"
)

# Send a message
response = client.messages.send_message(
    conversation_id=conversation['id'],
    content="How can I help you today?",
    role="user"
)

print(f"Agent response: {response['content']}")
```

---

## 🏗️ SDK Architecture

The SDK is organized into logical service modules:

```python
client = KnowrithmClient(api_key="...", api_secret="...")

# Service modules
client.agents         # Agent management
client.conversations  # Conversation handling  
client.documents      # Document processing
client.messages       # Message operations
client.analytics      # Analytics and metrics
client.leads          # Lead management
client.databases      # Database connections
client.auth           # Authentication
client.companies      # Company management
```

---

## 🔧 Core Services

### 🤖 Agent Management

Create and manage intelligent AI agents:

```python
from knowrithm_py.services.agent import AgentService

agent_service = AgentService(client)

# Create a specialized agent
agent = agent_service.create({
    "name": "Sales Assistant",
    "description": "Handles sales inquiries and lead qualification",
    "personality": "enthusiastic and helpful",
    "model_name": "gpt-4",
    "max_response_length": 300,
    "temperature": 0.7
})

# List all agents
agents = agent_service.list()

# Update agent configuration
agent_service.update(agent['id'], {
    "personality": "professional and concise"
})
```

### 💬 Conversation Management

Handle real-time conversations with context awareness:

```python
from knowrithm_py.services.conversation import ConversationService
from knowrithm_py.services.message import MessageService

conv_service = ConversationService(client)
msg_service = MessageService(client)

# Start a conversation
conversation = conv_service.create(
    agent_id=agent['id'],
    entity_type="USER"
)

# Send messages
response = msg_service.send_message(
    conversation_id=conversation['id'],
    content="I need help with my order",
    role="user"
)

# Get conversation history
messages = msg_service.list_messages(conversation['id'])

# End conversation with rating
conv_service.end_conversation(
    conversation_id=conversation['id'],
    rating=5
)
```

### 📚 Document Processing

Upload, process, and search through various document types:

```python
from knowrithm_py.services.document import DocumentService

doc_service = DocumentService(client)

# Upload document for training
document = doc_service.upload(
    file_path="path/to/company_faq.pdf",
    agent_id=agent['id']
)

# Check processing status
status = doc_service.get_processing_status(document['id'])
print(f"Processing status: {status['status']}")

# Search within documents
search_results = doc_service.search(
    query="refund policy",
    filters={"agent_id": agent['id']}
)

# List all documents
documents = doc_service.list(agent_id=agent['id'])
```

### 📊 Analytics & Monitoring

Access comprehensive analytics and performance metrics:

```python
from knowrithm_py.services.analytics import AnalyticsService

analytics = AnalyticsService(client)

# Get dashboard overview
dashboard = analytics.get_dashboard()
print(f"Total conversations: {dashboard['conversations']['total']}")

# Agent performance metrics
agent_metrics = analytics.get_agent_metrics(
    agent_id=agent['id'],
    start_date="2024-01-01T00:00:00Z",
    end_date="2024-01-31T23:59:59Z"
)

print(f"Average response time: {agent_metrics['performance_metrics']['avg_response_time_seconds']}s")
print(f"Satisfaction rating: {agent_metrics['quality_metrics']['avg_satisfaction_rating']}")

# Export analytics data
export_data = analytics.export_analytics_data({
    "type": "conversations",
    "format": "json",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-01-31T23:59:59Z"
})
```

### 👥 Lead Management

Track and convert leads through intelligent conversations:

```python
from knowrithm_py.services.lead import LeadService

lead_service = LeadService(client)

# Create a new lead
lead = lead_service.create({
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "source": "website_chat"
})

# Update lead status
lead_service.update_status(
    lead_id=lead['id'],
    status="qualified",
    notes="Interested in premium plan"
)

# Get lead analytics
lead_analytics = analytics.get_lead_analytics(
    start_date="2024-01-01T00:00:00Z",
    end_date="2024-01-31T23:59:59Z"
)
```

### 🗄️ Database Integration

Connect external databases for dynamic agent responses:

```python
from knowrithm_py.services.database import DatabaseService

db_service = DatabaseService(client)

# Create database connection
connection = db_service.create_connection({
    "name": "Customer Database",
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database": "customers",
    "username": "db_user",
    "password": "db_password"
})

# Test connection
test_result = db_service.test_connection(connection['id'])

# Search across databases
search_results = db_service.search(
    query="customer orders from last month",
    connection_ids=[connection['id']]
)
```

---

## 🔐 Authentication & Security

### API Key Management

```python
from knowrithm_py.services.auth import AuthService

auth_service = AuthService(client)

# Validate credentials
validation = auth_service.validate_credentials()
print(f"API key valid: {validation['valid']}")

# Create new API key
new_key = auth_service.create_api_key(
    name="Analytics Key",
    permissions={"read": True, "write": False}
)

# Get user profile
profile = auth_service.get_profile()
```

### Environment-based Configuration

```python
import os
from knowrithm_py.client import KnowrithmClient

# Recommended: Use environment variables
client = KnowrithmClient(
    api_key=os.getenv('KNOWRITHM_API_KEY'),
    api_secret=os.getenv('KNOWRITHM_API_SECRET'),
    base_url=os.getenv('KNOWRITHM_BASE_URL', 'https://app.knowrithm.org')
)
```

---

## 🛡️ Error Handling

The SDK provides comprehensive error handling:

```python
from knowrithm_py.exceptions import (
    KnowrithmAPIError,
    AuthenticationError,
    RateLimitError,
    ValidationError
)

try:
    agent = client.agents.create(agent_data)
except AuthenticationError:
    print("❌ Invalid API credentials")
except ValidationError as e:
    print(f"❌ Validation error: {e.message}")
except RateLimitError:
    print("⏳ Rate limit exceeded, please retry later")
except KnowrithmAPIError as e:
    print(f"❌ API error: {e.message}")
```

### Retry Logic with Exponential Backoff

```python
import time
from typing import Dict, Any

def safe_api_call(func, *args, max_retries=3, **kwargs) -> Dict[str, Any]:
    """Execute API calls with automatic retries"""
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except RateLimitError:
            if attempt == max_retries - 1:
                raise
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            time.sleep(wait_time)
        except KnowrithmAPIError as e:
            if e.status_code >= 500:  # Server errors
                if attempt == max_retries - 1:
                    raise
                time.sleep(2 ** attempt)
            else:
                raise  # Client errors shouldn't be retried
```

---

## 📊 Advanced Features

### Batch Operations

Process multiple operations efficiently:

```python
# Batch create multiple agents
agents_data = [
    {"name": "Sales Bot", "personality": "persuasive"},
    {"name": "Support Bot", "personality": "helpful"},
    {"name": "Technical Bot", "personality": "precise"}
]

agents = []
for agent_data in agents_data:
    agent = client.agents.create(agent_data)
    agents.append(agent)

# Batch upload documents
import os
from pathlib import Path

documents_folder = Path("./training_docs")
for file_path in documents_folder.glob("*.pdf"):
    document = client.documents.upload(
        file_path=str(file_path),
        agent_id=agent['id']
    )
    print(f"Uploaded: {file_path.name}")
```

### Streaming Responses

Handle real-time streaming responses:

```python
def handle_streaming_response(conversation_id, message):
    """Handle streaming responses from the agent"""
    response = client.messages.send_message_stream(
        conversation_id=conversation_id,
        content=message,
        role="user"
    )
    
    full_response = ""
    for chunk in response:
        if chunk.get('content'):
            print(chunk['content'], end='', flush=True)
            full_response += chunk['content']
    
    return full_response
```

### Webhook Integration

Set up webhooks for real-time notifications:

```python
from knowrithm_py.services.webhook import WebhookService

webhook_service = WebhookService(client)

# Create webhook endpoint
webhook = webhook_service.create({
    "url": "https://your-app.com/webhooks/knowrithm",
    "events": ["conversation.started", "message.received", "lead.created"],
    "secret": "your-webhook-secret"
})

# Verify webhook signature (in your webhook handler)
def verify_webhook_signature(payload, signature, secret):
    import hmac
    import hashlib
    
    expected_signature = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_signature}", signature)
```

---

## 🔧 Configuration Options

### Client Configuration

```python
client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret",
    base_url="https://app.knowrithm.org",
    timeout=30,                    # Request timeout in seconds
    max_retries=3,                 # Automatic retry attempts
    retry_delay=1,                 # Base delay between retries
    enable_logging=True,           # Enable request/response logging
    log_level="INFO"               # Logging level
)
```

### Agent Configuration

```python
agent_config = {
    "name": "Advanced Support Bot",
    "description": "AI assistant for complex customer support",
    "personality": "professional, empathetic, and solution-oriented",
    "model_name": "gpt-4",
    "temperature": 0.7,            # Creativity level (0-1)
    "max_response_length": 500,    # Maximum response tokens
    "response_config": {
        "include_sources": True,    # Include source references
        "tone": "professional",     # Response tone
        "fallback_message": "I need more information to help you."
    }
}

agent = client.agents.create(agent_config)
```

---

## 📋 SDK Reference

### Complete Service List

| Service | Description | Key Methods |
|---------|-------------|-------------|
| `AgentService` | Manage AI agents | `create()`, `list()`, `update()`, `delete()` |
| `ConversationService` | Handle conversations | `create()`, `list()`, `end_conversation()` |
| `MessageService` | Send/receive messages | `send_message()`, `list_messages()` |
| `DocumentService` | Process documents | `upload()`, `search()`, `list()` |
| `AnalyticsService` | Access metrics | `get_dashboard()`, `get_agent_metrics()` |
| `LeadService` | Manage leads | `create()`, `update_status()`, `list()` |
| `DatabaseService` | Database integration | `create_connection()`, `search()` |
| `AuthService` | Authentication | `validate_credentials()`, `get_profile()` |
| `CompanyService` | Company management | `get()`, `get_statistics()` |

---

## 🚀 Best Practices

### 1. Environment Management

```python
# Use different configurations for different environments
import os
from knowrithm_py.client import KnowrithmClient

def create_client():
    environment = os.getenv('ENVIRONMENT', 'development')
    
    if environment == 'production':
        return KnowrithmClient(
            api_key=os.getenv('PROD_API_KEY'),
            api_secret=os.getenv('PROD_API_SECRET'),
            base_url='https://app.knowrithm.org',
            timeout=30
        )
    else:
        return KnowrithmClient(
            api_key=os.getenv('DEV_API_KEY'),
            api_secret=os.getenv('DEV_API_SECRET'),
            base_url='https://staging.knowrithm.org',
            timeout=60,
            enable_logging=True
        )

client = create_client()
```

### 2. Performance Monitoring

```python
import logging
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            logging.info(f"{func.__name__} completed in {duration:.2f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logging.error(f"{func.__name__} failed after {duration:.2f}s: {e}")
            raise
    return wrapper

@monitor_performance
def create_and_train_agent(name, documents):
    agent = client.agents.create({"name": name})
    
    for doc_path in documents:
        client.documents.upload(doc_path, agent['id'])
    
    return agent
```

### 3. Resource Management

```python
from contextlib import contextmanager

@contextmanager
def conversation_context(agent_id, entity_type="USER"):
    """Context manager for conversation lifecycle"""
    conversation = client.conversations.create(
        agent_id=agent_id,
        entity_type=entity_type
    )
    
    try:
        yield conversation
    finally:
        # Clean up - end conversation
        client.conversations.end_conversation(
            conversation_id=conversation['id'],
            rating=5
        )

# Usage
with conversation_context(agent['id']) as conv:
    response = client.messages.send_message(
        conversation_id=conv['id'],
        content="Hello!",
        role="user"
    )
```

---

## 📚 Related Documentation

- **[Client Setup Guide](client-setup.md)** - Detailed client configuration
- **[Agent Management](agents.md)** - Complete agent operations
- **[Conversation Handling](conversations.md)** - Advanced conversation features
- **[Document Processing](documents.md)** - File upload and processing
- **[Analytics Dashboard](analytics.md)** - Metrics and reporting
- **[Code Examples](examples.md)** - Real-world implementation examples

---

## 🤝 Contributing

We welcome contributions to the Knowrithm Python SDK! See our [Contributing Guide](https://github.com/Knowrithm/knowrithm-py/blob/main/CONTRIBUTING.md) for details.

---

## 📞 Support

- 📚 **Documentation**: [docs.knowrithm.org](https://docs.knowrithm.org)
- 💬 **Discord**: [Join our community](https://discord.gg/cHHWfghJrR)
- 📧 **Email**: support@knowrithm.org
- 🐛 **Issues**: [GitHub Issues](https://github.com/Knowrithm/knowrithm-py/issues)

---

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; color: white; text-align: center; margin: 32px 0;">

**Ready to dive deeper?**

[Explore Client Setup](client-setup.md) • [View Examples](examples.md) • [Check API Reference](../api-reference/)

</div>
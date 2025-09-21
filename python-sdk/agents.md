# Agent Management

This guide provides a comprehensive overview of how to create, configure, and manage your AI agents using the Knowrithm Python SDK. Agents are the core of the Knowrithm platform, acting as specialized AI assistants trained on your data.

## What is an Agent?

An agent is an AI entity with a distinct personality, knowledge base, and configuration. Each agent can be tailored for a specific purpose, such as customer support, sales, or internal helpdesks.

### Core Components of an Agent
- **Personality**: Defines the agent's tone and style of communication (e.g., "friendly and helpful," "professional and concise").
- **Knowledge Base**: The information an agent uses to answer questions, built from uploaded documents, connected databases, and website content.
- **Model Configuration**: The underlying AI model (`gpt-4`, etc.), creativity (`temperature`), and response length constraints.
- **System Prompt**: A set of high-level instructions that guide the agent's behavior and purpose.

---

## Creating an Agent

Use the `AgentService` to create and manage agents.

### Simple Agent Creation

The only required fields are `name` and `description`.

```python
from knowrithm_py.services.agent import AgentService

agent_service = AgentService(client)

# Create a basic agent
agent = agent_service.create({
    "name": "Internal Helpdesk Bot",
    "description": "Assists employees with internal company questions."
})

print(f"Agent created with ID: {agent['id']}")
```

### Advanced Agent Creation

You can specify numerous parameters to fine-tune your agent's behavior from the start.

```python
agent_config = {
    "name": "Proactive Sales Assistant",
    "description": "Engages website visitors to qualify leads and drive sales.",
    "personality": "Enthusiastic, persuasive, and knowledgeable about our products.",
    "model_name": "gpt-4",
    "temperature": 0.8,  # Higher temperature for more creative, less repetitive responses
    "max_response_length": 400,
    "system_prompt": "You are a top-performing sales development representative. Your goal is to understand the customer's needs, recommend the best products, and encourage them to sign up for a demo.",
    "response_config": {
        "tone": "persuasive",
        "include_sources": False, # Don't cite internal sales documents
        "fallback_message": "That's a great question. Let me connect you with a sales expert who can provide more details."
    }
}

advanced_agent = agent_service.create(agent_config)
print(f"Advanced agent '{advanced_agent['name']}' created successfully!")
```

---

## Managing Agents

Once an agent is created, you can list, update, or delete it.

### Listing Agents

Retrieve a list of all agents associated with your company.

```python
# List all agents
all_agents = agent_service.list()
print(f"Found {len(all_agents)} agents.")

# List agents with filtering and pagination
active_support_agents = agent_service.list(
    params={
        "status": "active",
        "search": "Support",
        "page": 1,
        "per_page": 10
    }
)

for agent in active_support_agents:
    print(f"- ID: {agent['id']}, Name: {agent['name']}")
```

### Getting Agent Details

Fetch the complete configuration for a single agent by its ID.

```python
agent_id = "your-agent-id"
agent_details = agent_service.get(agent_id)

print(f"Name: {agent_details['name']}")
print(f"Personality: {agent_details['personality']}")
print(f"Model: {agent_details['model_name']}")
```

### Updating an Agent

Modify an agent's configuration at any time.

```python
update_data = {
    "personality": "Professional and extremely concise.",
    "temperature": 0.2, # Lower temperature for more deterministic, factual responses
    "response_config": {
        "fallback_message": "I am unable to answer that question. Please rephrase or contact support."
    }
}

updated_agent = agent_service.update(agent_id, update_data)
print(f"Agent '{updated_agent['name']}' updated successfully.")
```

### Deleting and Restoring Agents

Agents are soft-deleted, allowing them to be restored if needed.

```python
# Soft-delete an agent
delete_response = agent_service.delete(agent_id)
print(f"Agent {agent_id} marked for deletion.")

# Restore a deleted agent
restore_response = agent_service.restore(agent_id)
print(f"Agent {agent_id} has been restored.")
```

---

## Agent Training

An agent's intelligence comes from the data it's trained on. Training is accomplished by associating data sources with an agent.

### Training with Documents

Upload documents to build an agent's knowledge base.

```python
from knowrithm_py.services.document import DocumentService

document_service = DocumentService(client)

# Upload a product manual to train the agent
doc = document_service.upload(
    file_path="./docs/product_manual.pdf",
    agent_id=agent_id
)

print(f"Document '{doc['filename']}' is now being processed for agent {agent_id}.")
```

See the Document Processing Guide for more details.

### Training with Databases

Connect external databases to allow agents to query for real-time information.

See the Database Integration Tutorial.

---

## Monitoring Agent Performance

Use the `AnalyticsService` to track how well your agents are performing.

```python
from knowrithm_py.services.analytics import AnalyticsService

analytics_service = AnalyticsService(client)

# Get detailed performance metrics for a specific agent
agent_metrics = analytics_service.get_agent_metrics(
    agent_id=agent_id,
    start_date="2024-01-01T00:00:00Z",
    end_date="2024-01-31T23:59:59Z"
)

print(f"Total Conversations: {agent_metrics['conversation_metrics']['total_conversations']}")
print(f"Avg. Response Time: {agent_metrics['performance_metrics']['avg_response_time_seconds']:.2f}s")
print(f"Avg. Satisfaction: {agent_metrics['quality_metrics']['avg_satisfaction_rating']:.1f}/5.0")
```

{ content-ref url="analytics.md" }
analytics.md
{ endcontent-ref }

---

## ◇ Best Practices

- **One Agent, One Purpose**: Create separate agents for distinct tasks (e.g., Sales vs. Support) to improve accuracy and maintainability.
- **Be Specific with Personality**: A detailed personality and system prompt dramatically improve response quality. Instead of "helpful," try "a cheerful and patient support expert who uses emojis and explains technical concepts in simple terms."
- **Iterate and Refine**: Start with a basic agent, test it with real questions, and use the feedback to update its personality, system prompt, and training data.
- **Use Naming Conventions**: Name agents clearly to reflect their purpose and environment (e.g., `Support-Bot-PROD`, `Sales-Assistant-DEV`).

---

## ⚙ Full Example

This script demonstrates the complete lifecycle of an agent.

```python
import time
from knowrithm_py.services.agent import AgentService
from knowrithm_py.services.document import DocumentService

def agent_lifecycle_example(client):
    agent_service = AgentService(client)
    
    # 1. Create an agent
    print("Creating a new agent...")
    agent = agent_service.create({
        "name": "Lifecycle Test Agent",
        "description": "An agent to demonstrate the full lifecycle.",
        "personality": "curious and informative"
    })
    agent_id = agent['id']
    print(f"Agent '{agent['name']}' created with ID: {agent_id}")

    # 2. Update the agent
    print("\nUpdating agent's personality...")
    agent_service.update(agent_id, {"personality": "direct and to-the-point"})
    updated_agent = agent_service.get(agent_id)
    print(f"Updated personality: {updated_agent['personality']}")

    # 3. List agents
    print("\nListing all agents...")
    agents = agent_service.list()
    print(f"Found {len(agents)} total agents.")

    # 4. Delete the agent
    print(f"\nDeleting agent {agent_id}...")
    agent_service.delete(agent_id)
    print("Agent deleted.")
    
    # Verify deletion (optional)
    time.sleep(1)
    try:
        agent_service.get(agent_id)
    except Exception as e:
        print(f"Verified agent is not accessible: {e}")

    # 5. Restore the agent
    print(f"\nRestoring agent {agent_id}...")
    agent_service.restore(agent_id)
    restored_agent = agent_service.get(agent_id)
    print(f"Agent '{restored_agent['name']}' restored successfully.")

    # Final cleanup
    agent_service.delete(agent_id)
    print("\nLifecycle example complete. Final cleanup done.")

# Assuming 'client' is an initialized KnowrithmClient
# agent_lifecycle_example(client)
```
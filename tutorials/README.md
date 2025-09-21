# Tutorials & Guides 📚

Welcome to the Knowrithm tutorials section! Here you'll find step-by-step guides, real-world examples, and best practices for building intelligent AI agents that transform your business.

---

## 🎯 What You'll Learn

Our tutorials cover everything from basic setup to advanced enterprise deployments:

- **🏃‍♂️ Quick Start**: Get your first agent running in 10 minutes
- **📚 Document Processing**: Train agents on your knowledge base
- **🗄️ Database Integration**: Connect agents to live data sources
- **📊 Analytics & Insights**: Monitor performance and optimize results
- **🔧 Production Deployment**: Scale to enterprise-grade solutions

{{ hint style="info" }}
**New to AI chatbots?** Start with our [Building Your First Agent](building-first-agent.md) tutorial. It covers all the fundamentals you need to know.
{{ endhint }}

---

## 🚀 Quick Start Tutorials

<table data-card-size="large" data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>🤖 Building Your First Agent</strong></td>
      <td>Create a customer service bot from scratch in under 15 minutes</td>
      <td><a href="building-first-agent.md">building-first-agent.md</a></td>
    </tr>
    <tr>
      <td><strong>📄 Document Processing</strong></td>
      <td>Upload PDFs, train your agent, and enable intelligent document search</td>
      <td><a href="document-processing.md">document-processing.md</a></td>
    </tr>
    <tr>
      <td><strong>🗄️ Database Integration</strong></td>
      <td>Connect your database and let agents answer questions with live data</td>
      <td><a href="database-integration.md">database-integration.md</a></td>
    </tr>
    <tr>
      <td><strong>📊 Advanced Analytics</strong></td>
      <td>Set up dashboards, track performance, and optimize agent responses</td>
      <td><a href="advanced-analytics.md">advanced-analytics.md</a></td>
    </tr>
  </tbody>
</table>

---

## 🏢 Industry-Specific Guides

### 🛒 E-commerce Solutions

Learn to build agents that drive sales and improve customer experience:

```python
# E-commerce agent example
agent = client.agents.create({
    "name": "Shopping Assistant",
    "personality": "helpful, enthusiastic, product-focused",
    "system_prompt": """
    You are a shopping assistant for an online store. Help customers:
    - Find products that match their needs
    - Compare features and prices
    - Process returns and exchanges
    - Track orders and shipping
    
    Always be helpful and aim to complete the sale while ensuring customer satisfaction.
    """,
    "model_name": "gpt-4",
    "temperature": 0.7
})
```

**Key Features:**
- Product recommendation engine
- Order processing and tracking
- Customer support automation
- Inventory management integration
- Sales analytics and conversion tracking

### 🏥 Healthcare Applications

Build HIPAA-compliant agents for healthcare organizations:

```python
# Healthcare agent with compliance
agent = client.agents.create({
    "name": "Patient Care Assistant",
    "personality": "professional, empathetic, precise",
    "compliance_mode": "HIPAA",
    "system_prompt": """
    You are a healthcare assistant. You can help with:
    - Appointment scheduling
    - General health information
    - Insurance questions
    - Prescription refill requests
    
    Always maintain patient confidentiality and direct serious medical questions to healthcare providers.
    """,
    "security_level": "high"
})
```

**Features:**
- Appointment scheduling integration
- Insurance verification
- Patient education resources
- Secure messaging compliance
- Medical record integration

### 💰 Financial Services

Create secure financial advisors and support agents:

```python
# Financial services agent
agent = client.agents.create({
    "name": "Financial Advisor",
    "personality": "trustworthy, professional, detail-oriented",
    "compliance_mode": "FINRA",
    "system_prompt": """
    You are a financial services assistant. Help customers with:
    - Account inquiries and balance checks
    - Investment information and market updates
    - Loan applications and credit questions
    - Fraud detection and security alerts
    
    Always comply with financial regulations and escalate complex investment advice to licensed advisors.
    """,
    "risk_assessment": "enabled"
})
```

### 🏠 Real Estate Solutions

Build agents that qualify leads and showcase properties:

```python
# Real estate agent
agent = client.agents.create({
    "name": "Property Specialist",
    "personality": "knowledgeable, patient, sales-oriented",
    "system_prompt": """
    You are a real estate assistant specializing in:
    - Property search and recommendations
    - Market analysis and pricing
    - Mortgage and financing information
    - Scheduling property tours
    - Lead qualification and follow-up
    
    Focus on understanding client needs and matching them with appropriate properties.
    """,
    "lead_scoring": "enabled"
})
```

---

## 📋 Tutorial Difficulty Levels

### 🟢 Beginner (15-30 minutes)
Perfect for developers new to Knowrithm or AI chatbots:

- [Building Your First Agent](building-first-agent.md)
- [Basic Document Upload](document-processing.md#basic-upload)
- [Simple Conversation Flow](building-first-agent.md#conversation-flow)
- [Widget Integration](../integrations/website-widget.md)

### 🟡 Intermediate (30-60 minutes)
For developers with basic experience looking to add advanced features:

- [Multi-Document Training](document-processing.md#advanced-training)
- [Database Integration](database-integration.md)
- [Custom Analytics Dashboard](advanced-analytics.md)
- [Lead Scoring System](building-first-agent.md#lead-management)

### 🔴 Advanced (1-2 hours)
Enterprise-level implementations with complex requirements:

- [Multi-Agent Orchestration](advanced-analytics.md#multi-agent-setup)
- [Custom Model Fine-tuning](document-processing.md#custom-models)
- [Production Deployment](../platform-guide/deployment.md)
- [Enterprise Security Setup](../platform-guide/security.md)

---

## 🎨 Code Examples by Language

### Python Examples

```python
# Complete agent setup with error handling
import os
from knowrithm_py import KnowrithmClient
from knowrithm_py.exceptions import KnowrithmAPIError

def create_support_agent():
    try:
        client = KnowrithmClient(
            api_key=os.getenv('KNOWRITHM_API_KEY'),
            api_secret=os.getenv('KNOWRITHM_API_SECRET')
        )
        
        # Create agent
        agent = client.agents.create({
            "name": "Customer Support Bot",
            "description": "24/7 customer support assistant",
            "personality": "friendly, helpful, solution-focused",
            "model_name": "gpt-4",
            "temperature": 0.6,
            "max_response_length": 400
        })
        
        # Upload training documents
        documents = [
            "./docs/faq.pdf",
            "./docs/product_manual.pdf",
            "./docs/troubleshooting.pdf"
        ]
        
        for doc_path in documents:
            if os.path.exists(doc_path):
                client.documents.upload(doc_path, agent['id'])
                print(f"✅ Uploaded: {doc_path}")
        
        return agent
        
    except KnowrithmAPIError as e:
        print(f"❌ API Error: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

# Usage
agent = create_support_agent()
if agent:
    print(f"🤖 Agent created successfully: {agent['name']}")
```

### JavaScript/Node.js Examples

```javascript
// Node.js agent creation with async/await
const KnowrithmClient = require('knowrithm-js');

async function createSalesAgent() {
    const client = new KnowrithmClient({
        apiKey: process.env.KNOWRITHM_API_KEY,
        apiSecret: process.env.KNOWRITHM_API_SECRET
    });
    
    try {
        // Create agent
        const agent = await client.agents.create({
            name: 'Sales Assistant',
            description: 'Converts leads into customers',
            personality: 'enthusiastic, persuasive, knowledgeable',
            modelName: 'gpt-4',
            temperature: 0.8
        });
        
        // Start conversation
        const conversation = await client.conversations.create({
            agentId: agent.id,
            entityType: 'LEAD'
        });
        
        console.log(`🤖 Agent created: ${agent.name}`);
        console.log(`💬 Conversation started: ${conversation.id}`);
        
        return { agent, conversation };
        
    } catch (error) {
        console.error('❌ Error creating agent:', error.message);
        throw error;
    }
}

// Usage
createSalesAgent()
    .then(({ agent, conversation }) => {
        console.log('✅ Setup complete!');
    })
    .catch(error => {
        console.error('❌ Setup failed:', error);
    });
```

### cURL Examples

```bash
#!/bin/bash

# Environment setup
export API_KEY="your-api-key"
export API_SECRET="your-api-secret"
export BASE_URL="https://app.knowrithm.org/api/v1"

# Function to create agent
create_agent() {
    local name=$1
    local personality=$2
    
    curl -X POST "$BASE_URL/agent" \
        -H "X-API-Key: $API_KEY" \
        -H "X-API-Secret: $API_SECRET" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"personality\": \"$personality\",
            \"model_name\": \"gpt-4\"
        }"
}

# Function to upload document
upload_document() {
    local file_path=$1
    local agent_id=$2
    
    curl -X POST "$BASE_URL/document/upload" \
        -H "X-API-Key: $API_KEY" \
        -H "X-API-Secret: $API_SECRET" \
        -F "file=@$file_path" \
        -F "agent_id=$agent_id"
}

# Create and setup agent
echo "🤖 Creating support agent..."
AGENT_RESPONSE=$(create_agent "Support Bot" "helpful and professional")
AGENT_ID=$(echo $AGENT_RESPONSE | jq -r '.data.id')

echo "📚 Uploading training documents..."
upload_document "./faq.pdf" $AGENT_ID
upload_document "./manual.pdf" $AGENT_ID

echo "✅ Agent setup complete! Agent ID: $AGENT_ID"
```

---

## 🔧 Advanced Integration Patterns

### Microservices Architecture

```python
# Agent service in a microservices setup
from flask import Flask, request, jsonify
from knowrithm_py import KnowrithmClient

app = Flask(__name__)
client = KnowrithmClient(...)

class AgentService:
    def __init__(self):
        self.agents = {}
        self.load_agents()
    
    def load_agents(self):
        """Load existing agents on startup"""
        agents = client.agents.list()
        for agent in agents['data']:
            self.agents[agent['id']] = agent
    
    def get_response(self, agent_id, message, context=None):
        """Get response from specific agent"""
        try:
            conversation = client.conversations.create(
                agent_id=agent_id,
                entity_type="USER"
            )
            
            response = client.messages.send_message(
                conversation_id=conversation['id'],
                content=message,
                role="user"
            )
            
            return {
                'success': True,
                'response': response['content'],
                'conversation_id': conversation['id']
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# REST endpoints
agent_service = AgentService()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    result = agent_service.get_response(
        agent_id=data['agent_id'],
        message=data['message']
    )
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
```

### Event-Driven Architecture

```python
# Event-driven agent responses
import asyncio
import json
from typing import Dict, Any

class EventDrivenAgent:
    def __init__(self, client):
        self.client = client
        self.event_handlers = {}
        
    def on_event(self, event_type: str):
        """Decorator to register event handlers"""
        def decorator(func):
            self.event_handlers[event_type] = func
            return func
        return decorator
    
    async def handle_event(self, event: Dict[str, Any]):
        """Process incoming events"""
        event_type = event.get('type')
        handler = self.event_handlers.get(event_type)
        
        if handler:
            await handler(event)
        else:
            print(f"No handler for event type: {event_type}")

# Usage
agent_system = EventDrivenAgent(client)

@agent_system.on_event('user_message')
async def handle_user_message(event):
    message = event['data']['message']
    conversation_id = event['data']['conversation_id']
    
    response = client.messages.send_message(
        conversation_id=conversation_id,
        content=message,
        role="user"
    )
    
    # Emit response event
    await emit_event({
        'type': 'agent_response',
        'data': {
            'response': response['content'],
            'conversation_id': conversation_id
        }
    })

@agent_system.on_event('lead_created')
async def handle_new_lead(event):
    lead = event['data']['lead']
    
    # Auto-assign to appropriate agent
    agent = await find_best_agent_for_lead(lead)
    
    # Start welcome conversation
    conversation = client.conversations.create(
        agent_id=agent['id'],
        entity_type="LEAD"
    )
    
    welcome_message = f"Hi {lead['first_name']}! Welcome to our service. How can I help you today?"
    
    client.messages.send_message(
        conversation_id=conversation['id'],
        content=welcome_message,
        role="assistant"
    )
```

---

## 📊 Performance Monitoring

### Agent Performance Tracking

```python
# Monitor and optimize agent performance
import time
from datetime import datetime, timedelta

class AgentMonitor:
    def __init__(self, client):
        self.client = client
        
    def get_agent_health_score(self, agent_id: str) -> Dict[str, Any]:
        """Calculate comprehensive health score for an agent"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # Get performance metrics
        metrics = self.client.analytics.get_agent_metrics(
            agent_id=agent_id,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat()
        )
        
        # Calculate health score components
        response_time_score = self._calculate_response_time_score(
            metrics['performance_metrics']['avg_response_time_seconds']
        )
        
        satisfaction_score = self._calculate_satisfaction_score(
            metrics['quality_metrics']['avg_satisfaction_rating']
        )
        
        engagement_score = self._calculate_engagement_score(
            metrics['conversation_metrics']['total_conversations'],
            metrics['conversation_metrics']['avg_messages_per_conversation']
        )
        
        # Overall health score (weighted average)
        health_score = (
            response_time_score * 0.3 +
            satisfaction_score * 0.4 +
            engagement_score * 0.3
        )
        
        return {
            'overall_score': round(health_score, 2),
            'components': {
                'response_time': response_time_score,
                'satisfaction': satisfaction_score,
                'engagement': engagement_score
            },
            'recommendations': self._generate_recommendations(metrics)
        }
    
    def _calculate_response_time_score(self, avg_response_time: float) -> float:
        """Score based on response time (lower is better)"""
        if avg_response_time <= 1.0:
            return 100
        elif avg_response_time <= 3.0:
            return 90 - ((avg_response_time - 1) * 20)
        elif avg_response_time <= 5.0:
            return 50 - ((avg_response_time - 3) * 15)
        else:
            return max(0, 20 - ((avg_response_time - 5) * 5))
    
    def _calculate_satisfaction_score(self, avg_rating: float) -> float:
        """Score based on user satisfaction ratings"""
        return (avg_rating / 5.0) * 100
    
    def _calculate_engagement_score(self, total_conversations: int, avg_messages: float) -> float:
        """Score based on user engagement metrics"""
        conversation_score = min(total_conversations / 100, 1.0) * 50
        message_score = min(avg_messages / 10, 1.0) * 50
        return conversation_score + message_score
    
    def _generate_recommendations(self, metrics: Dict[str, Any]) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        if metrics['performance_metrics']['avg_response_time_seconds'] > 3:
            recommendations.append("Consider optimizing agent training data to improve response times")
        
        if metrics['quality_metrics']['avg_satisfaction_rating'] < 4:
            recommendations.append("Review conversation logs to identify areas for improvement")
        
        if metrics['conversation_metrics']['avg_messages_per_conversation'] < 3:
            recommendations.append("Enhance agent personality to encourage longer conversations")
            
        return recommendations

# Usage example
monitor = AgentMonitor(client)
health_data = monitor.get_agent_health_score("agent_123")

print(f"Agent Health Score: {health_data['overall_score']}/100")
for recommendation in health_data['recommendations']:
    print(f"💡 {recommendation}")
```

---

## 🎓 Learning Path

### Week 1: Foundations
- [x] [Installation and Setup](../getting-started/installation.md)
- [x] [Building Your First Agent](building-first-agent.md)
- [x] [Basic Document Upload](document-processing.md)
- [x] [Simple Conversations](building-first-agent.md)

### Week 2: Data Integration  
- [ ] [Advanced Document Processing](document-processing.md)
- [ ] [Database Connections](database-integration.md)
- [ ] [Search and Retrieval](document-processing.md)
- [ ] [Data Security Best Practices](../platform-guide/security.md)

### Week 3: Analytics and Optimization
- [ ] [Analytics Dashboard](advanced-analytics.md)
- [ ] [Performance Monitoring](advanced-analytics.md)
- [ ] [A/B Testing](advanced-analytics.md)
- [ ] [Lead Conversion Tracking](building-first-agent.md)

### Week 4: Production Deployment
- [ ] [Scaling Strategies](../platform-guide/deployment.md)
- [ ] [Security Implementation](../platform-guide/security.md)
- [ ] [Monitoring and Alerts](../platform-guide/monitoring.md)
- [ ] [Backup and Recovery](../platform-guide/deployment.md)

---

## 📚 Additional Resources

### Video Tutorials
- 🎥 **[Agent Setup Walkthrough](https://youtube.com/knowrithm)** (15 minutes)
- 🎥 **[Document Training Deep Dive](https://youtube.com/knowrithm)** (25 minutes)
- 🎥 **[Analytics Dashboard Tour](https://youtube.com/knowrithm)** (20 minutes)
- 🎥 **[Production Deployment Guide](https://youtube.com/knowrithm)** (45 minutes)

### Community Examples
- 📂 **[GitHub Examples Repository](https://github.com/Knowrithm/examples)**
- 💬 **[Discord Community](https://discord.gg/cHHWfghJrR)** - Share your implementations
- 📝 **[Community Blog](https://blog.knowrithm.org)** - Real-world case studies

### Documentation Links
- 📖 **[Python SDK Reference](../python-sdk/)** - Complete SDK documentation
- 🔌 **[API Reference](../api-reference/)** - REST API endpoints
- 🏗️ **[Platform Guide](../platform-guide/)** - Architecture and deployment
- 🔗 **[Integrations](../integrations/)** - Third-party connections

---

## 🤝 Community and Support

### Getting Help
1. **Search Documentation**: Most questions are answered in our guides
2. **Check Examples**: Look for similar implementations in our examples
3. **Ask the Community**: Join our Discord for peer support
4. **Contact Support**: Reach out for enterprise-level assistance

### Contributing
Share your tutorials and examples with the community:
- Submit tutorial improvements via GitHub
- Share your implementations in Discord
- Write guest posts for our community blog
- Contribute to open-source examples

---

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; color: white; text-align: center; margin: 32px 0;">

**Ready to become a Knowrithm expert?**

[Start with Your First Agent](building-first-agent.md) • [Join Our Community](https://discord.gg/cHHWfghJrR) • [View Examples](https://github.com/Knowrithm/examples)

</div>
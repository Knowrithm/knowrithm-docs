# Quick Start Guide

Get up and running with Knowrithm in under 10 minutes! This guide will walk you through creating your first AI agent, training it with documents, and having your first conversation.

## What You'll Build

By the end of this guide, you'll have:

- ✅ A functional AI agent
- ✅ Document-trained knowledge base
- ✅ Working conversation system
- ✅ Basic analytics setup

## Prerequisites

Make sure you have completed:

- [ ] [Installation](installation.md) - SDK installed
- [ ] [Authentication](authentication.md) - API credentials ready

## Step 1: Initialize the Client

Create a new Python file called `quick_start.py`.

```python
# quick_start.py
import os
from knowrithm_py.knowrithm.client import KnowrithmClient

# Initialize the client with your credentials
client = KnowrithmClient(
    api_key=os.getenv('KNOWRITHM_API_KEY'),
    api_secret=os.getenv('KNOWRITHM_API_SECRET'),
    base_url="https://app.knowrithm.org"
)

print("✅ Client initialized successfully!") 
```

## Step 2: Create Your First Agent

```python
from knowrithm_py.services.agent import AgentService

# Initialize agent service
agent_service = AgentService(client)

# Create a new agent
agent_data = {
    "name": "My First Assistant",
    "description": "A helpful customer service agent",
    "personality": "friendly, professional, and knowledgeable",
    "model_name": "gpt-4",
    "max_response_length": 500
}

agent = agent_service.create(agent_data)
print(f"✅ Agent created with ID: {agent['id']}")
print(f"📝 Agent name: {agent['name']}")
```

## Step 3: Upload Training Documents

Create a sample FAQ file or use your own document:

```python
from knowrithm_py.services.document import DocumentService

# Initialize document service
document_service = DocumentService(client)

# Create a sample FAQ content (save this to a file first)
faq_content = """
Frequently Asked Questions

Q: What are your business hours?
A: We are open Monday through Friday, 9 AM to 5 PM EST.

Q: How do I reset my password?
A: Click on 'Forgot Password' on the login page and follow the instructions.

Q: Do you offer refunds?
A: Yes, we offer full refunds within 30 days of purchase.

Q: How can I contact support?
A: You can reach us at support@example.com or call 1-800-SUPPORT.
"""

# Save to file
with open("sample_faq.txt", "w") as f:
    f.write(faq_content)

# Upload the document
doc_response = document_service.upload(
    file_path="sample_faq.txt",
    agent_id=agent['id']
)

print(f"✅ Document uploaded with ID: {doc_response['id']}")
print(f"📄 Processing status: {doc_response.get('status', 'processing')}")
```

## Step 4: Wait for Processing (Optional Check)

```python
import time

# Check processing status (optional)
def wait_for_processing(document_id, max_wait=60):
    for i in range(max_wait):
        status_response = document_service.get_processing_status(document_id)
        status = status_response.get('status', 'processing')
        
        if status == 'completed':
            print("✅ Document processing completed!")
            return True
        elif status == 'failed':
            print("❌ Document processing failed!")
            return False
        
        print(f"⏳ Processing... ({i+1}s)")
        time.sleep(1)
    
    print("⚠️ Processing timeout, but continuing...")
    return False

# Wait for processing to complete
wait_for_processing(doc_response['id'])
```

## Step 5: Start Your First Conversation

```python
from knowrithm_py.services.conversation import ConversationService, MessageService

# Initialize conversation services
conversation_service = ConversationService(client)
message_service = MessageService(client)

# Create a new conversation
conversation = conversation_service.create(
    agent_id=agent['id'],
    entity_type="USER"
)

print(f"✅ Conversation created with ID: {conversation['id']}")
```

## Step 6: Chat with Your Agent

```python
def chat_with_agent(conversation_id, message_text):
    """Send a message and get a response from the agent"""
    try:
        response = message_service.send_message(
            conversation_id=conversation_id,
            content=message_text,
            role="user"
        )
        return response.get('content', 'Sorry, I could not process your request.')
    except Exception as e:
        return f"Error: {str(e)}"

# Test different questions
test_questions = [
    "What are your business hours?",
    "How do I reset my password?",
    "Do you offer refunds?",
    "How can I contact support?"
]

print("\n🤖 Starting conversation with your AI agent")

for question in test_questions:
    print(f"\n👤 You: {question}")
    response = chat_with_agent(conversation['id'], question)
    print(f"🤖 Agent: {response}")
    print("-" * 50)
```

## Step 7: Get Basic Analytics

```python
from knowrithm_py.services.analytics import AnalyticsService

# Initialize analytics service
analytics_service = AnalyticsService(client)

# Get dashboard overview
try:
    dashboard = analytics_service.get_dashboard()
    print("\n📊 Dashboard Analytics:")
    print(f"Total agents: {dashboard.get('agents', {}).get('total', 0)}")
    print(f"Active conversations: {dashboard.get('conversations', {}).get('active', 0)}")
    print(f"Total messages today: {dashboard.get('messages', {}).get('today', 0)}")
except Exception as e:
    print(f"Analytics not yet available: {e}")

# Get agent-specific metrics
try:
    agent_metrics = analytics_service.get_agent_metrics(
        agent_id=agent['id'],
        start_date="2024-01-01T00:00:00Z",
        end_date="2024-12-31T23:59:59Z"
    )
    print(f"\n🎯 Agent Performance:")
    print(f"Total conversations: {agent_metrics.get('conversation_metrics', {}).get('total_conversations', 0)}")
    print(f"Average response time: {agent_metrics.get('performance_metrics', {}).get('avg_response_time_seconds', 0):.2f}s")
except Exception as e:
    print(f"Agent metrics not yet available: {e}")
```

## Complete Script

Here's the complete `quick_start.py` script:

```python
#!/usr/bin/env python3
"""
Knowrithm Quick Start Guide
Create your first AI agent in under 10 minutes!
"""

import os
import time
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.services.agent import AgentService
from knowrithm_py.services.document import DocumentService
from knowrithm_py.services.conversation import ConversationService, MessageService
from knowrithm_py.services.analytics import AnalyticsService

def main():
    print("🚀 Knowrithm Quick Start Guide")
    print("=" * 50)
    
    # Step 1: Initialize Client
    print("\n1️⃣ Initializing client...")
    client = KnowrithmClient(
        api_key=os.getenv('KNOWRITHM_API_KEY'),
        api_secret=os.getenv('KNOWRITHM_API_SECRET'),
        base_url="https://app.knowrithm.org"
    )
    print("✅ Client initialized!")
    
    # Step 2: Create Agent
    print("\n2️⃣ Creating your AI agent...")
    agent_service = AgentService(client)
    agent = agent_service.create({
        "name": "Quick Start Assistant",
        "description": "My first Knowrithm AI agent",
        "personality": "helpful, friendly, and knowledgeable"
    })
    print(f"✅ Agent '{agent['name']}' created with ID: {agent['id']}")
    
    # Step 3: Upload Document
    print("\n3️⃣ Creating and uploading training document...")
    
    # Create sample FAQ
    faq_content = """
Frequently Asked Questions

Q: What are your business hours?
A: We are open Monday through Friday, 9 AM to 5 PM EST.

Q: How do I reset my password?
A: Click 'Forgot Password' on the login page and follow the email instructions.

Q: Do you offer refunds?
A: Yes, we offer full refunds within 30 days of purchase with proof of purchase.

Q: How can I contact support?
A: Email us at support@example.com or call 1-800-SUPPORT during business hours.

Q: What payment methods do you accept?
A: We accept all major credit cards, PayPal, and bank transfers.
"""
    
    # Save and upload document
    with open("quick_start_faq.txt", "w") as f:
        f.write(faq_content)
    
    document_service = DocumentService(client)
    doc_response = document_service.upload(
        file_path="quick_start_faq.txt",
        agent_id=agent['id']
    )
    print(f"✅ Document uploaded and processing...")
    
    # Step 4: Wait for processing
    print("\n4️⃣ Waiting for document processing...")
    time.sleep(3)  # Brief wait for processing
    print("✅ Ready to chat!")
    
    # Step 5: Create Conversation
    print("\n5️⃣ Starting conversation...")
    conversation_service = ConversationService(client)
    message_service = MessageService(client)
    
    conversation = conversation_service.create(
        agent_id=agent['id'],
        entity_type="USER"
    )
    print(f"✅ Conversation started!")
    
    # Step 6: Chat with Agent
    print("\n6️⃣ Testing your AI agent...")
    
    def ask_question(question):
        try:
            response = message_service.send_message(
                conversation_id=conversation['id'],
                content=question,
                role="user"
            )
            return response.get('content', 'No response available.')
        except Exception as e:
            return f"Error: {str(e)}"
    
    # Test questions
    test_questions = [
        "What are your business hours?",
        "How do I reset my password?",
        "Do you accept PayPal?"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n  Test {i}/3:")
        print(f"  👤 Question: {question}")
        response = ask_question(question)
        print(f"  🤖 Response: {response}")
        print("  " + "─" * 60)
    
    # Step 7: Show Analytics
    print("\n7️⃣ Checking analytics...")
    try:
        analytics_service = AnalyticsService(client)
        dashboard = analytics_service.get_dashboard()
        print(f"✅ Total agents in your account: {dashboard.get('agents', {}).get('total', 1)}")
        print(f"✅ Messages sent today: {dashboard.get('messages', {}).get('today', 0)}")
    except Exception as e:
        print(f"⚠️ Analytics will be available shortly after more usage")
    
    # Success!
    print("\n🎉 Congratulations! Your AI agent is ready!")
    print("\n📋 What you've accomplished:")
    print("   ✅ Created and configured an AI agent")
    print("   ✅ Uploaded and processed training documents")
    print("   ✅ Successfully tested conversations")
    print("   ✅ Accessed basic analytics")
    
    print(f"\n🔗 Your agent ID: {agent['id']}")
    print(f"🔗 Conversation ID: {conversation['id']}")
    
    print("\n🚀 Next steps:")
    print("   • Add more training documents")
    print("   • Integrate with your website")
    print("   • Set up lead management")
    print("   • Explore advanced analytics")
    
    # Clean up
    os.remove("quick_start_faq.txt")
    print("\n✨ Quick start complete!")

if __name__ == "__main__":
    main()
```

## Running Your First Agent

1. **Set your environment variables** (in `.env` file or terminal):
   ```bash
   export KNOWRITHM_API_KEY="your-api-key"
   export KNOWRITHM_API_SECRET="your-api-secret"
   ```

2. **Run the script**:
   ```bash
   python quick_start.py
   ```

3. **Expected output**:
   ```
   🚀 Knowrithm Quick Start Guide
   ==================================================
   
   1️⃣ Initializing client...
   ✅ Client initialized!
   
   2️⃣ Creating your AI agent...
   ✅ Agent 'Quick Start Assistant' created with ID: agent_123
   
   3️⃣ Creating and uploading training document...
   ✅ Document uploaded and processing...
   
   4️⃣ Waiting for document processing...
   ✅ Ready to chat!
   
   5️⃣ Starting conversation...
   ✅ Conversation started!
   
   6️⃣ Testing your AI agent...
   
     Test 1/3:
     👤 Question: What are your business hours?
     🤖 Response: We are open Monday through Friday, 9 AM to 5 PM EST.
     ────────────────────────────────────────────────────────────
   
   🎉 Congratulations! Your AI agent is ready!
   ```

## Interactive Testing

Want to chat interactively? Add this to the end of your script:

```python
def interactive_chat():
    """Start an interactive chat session"""
    print("\n💬 Interactive Chat Mode (type 'quit' to exit)")
    print("─" * 50)
    
    while True:
        try:
            user_input = input("\n👤 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("🤖 Goodbye! Thanks for chatting!")
                break
                
            if not user_input:
                continue
                
            response = message_service.send_message(
                conversation_id=conversation['id'],
                content=user_input,
                role="user"
            )
            
            print(f"🤖 Agent: {response.get('content', 'Sorry, I had trouble processing that.')}")
            
        except KeyboardInterrupt:
            print("\n\n🤖 Chat session ended. Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

# Add this call to main() if you want interactive mode
# interactive_chat()
```

## Troubleshooting

### Common Issues

1. **API Key Error**
   ```python
   # Check your credentials
   print(f"API Key: {os.getenv('KNOWRITHM_API_KEY')[:10]}...")
   print(f"API Secret: {os.getenv('KNOWRITHM_API_SECRET')[:10]}...")
   ```

2. **Document Processing Takes Too Long**
   ```python
   # Check processing status
   status = document_service.get_processing_status(doc_response['id'])
   print(f"Status: {status}")
   ```

3. **No Response from Agent**
   ```python
   # Check if agent has processed documents
   docs = document_service.list(agent_id=agent['id'])
   print(f"Documents: {len(docs)} uploaded")
   ```

## What's Next?

Now that you have a working agent, explore these features:
### Immediate Next Steps
- Upload more document types
- Advanced conversation handling
- Add to your website
### Advanced Features
- Connect databases
- Detailed analytics
- Lead management system
### Production Ready
- Security best practices
- Production deployment
- Monitoring and alerts

{% hint style="success" %}
**🎉 Congratulations!** You've successfully created your first AI agent with Knowrithm. Your agent can now answer questions based on the documents you uploaded.
{% endhint %}

{% hint style="info" %}
**Want to see more examples?** Check out our [Code Examples](../python-sdk/examples.md) section for more advanced use cases and patterns.
{% endhint %}

{% hint style="tip" %}
**Pro Tip**: The more relevant documents you upload, the smarter your agent becomes. Try uploading your product documentation, FAQs, or knowledge base articles!
{% endhint %}
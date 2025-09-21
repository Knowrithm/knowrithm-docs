# 🤖 Building Your First AI Agent

Welcome to your first Knowrithm tutorial! In the next 15 minutes, you'll build a complete customer support agent from scratch, train it with a knowledge base, and have your first conversation.

---

## 🎯 What You'll Build

By the end of this tutorial, you will have:
- A fully configured AI agent with a unique personality.
- A knowledge base trained on a custom FAQ document.
- A working conversation loop to chat with your agent.
- An understanding of how to view basic performance analytics.

---

## 📋 Prerequisites

Before you start, ensure you have the following:
- A Knowrithm account and your API credentials.
- Python 3.8+ installed on your machine.
- The Knowrithm Python SDK installed (`pip install knowrithm-py`).

{% content-ref url="../getting-started/installation.md" %}
installation.md
{% endcontent-ref %}

---

## 🛠️ Step 1: Project Setup

First, let's set up your project directory and Python environment.

1.  **Create a Project Folder**:
    ```bash
    mkdir knowrithm-support-bot
    cd knowrithm-support-bot
    ```

2.  **Set Up a Virtual Environment** (Recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install knowrithm-py python-dotenv
    ```

4.  **Store Your Credentials**: Create a file named `.env` and add your API credentials.
    ```ini
    # .env
    KNOWRITHM_API_KEY="your-api-key-here"
    KNOWRITHM_API_SECRET="your-api-secret-here"
    ```

---

## 🐍 Step 2: Initialize the Client

Create a Python file named `support_bot.py`. This will be our main script.

```python
# support_bot.py
import os
from dotenv import load_dotenv
from knowrithm_py.knowrithm.client import KnowrithmClient

# Load environment variables from .env file
load_dotenv()

print("1. Initializing Knowrithm client...")

try:
    client = KnowrithmClient(
        api_key=os.getenv("KNOWRITHM_API_KEY"),
        api_secret=os.getenv("KNOWRITHM_API_SECRET"),
    )
    print("✅ Client initialized successfully!")
except ValueError as e:
    print(f"❌ Error: {e}. Make sure your API credentials are in the .env file.")
    exit()
```

---

## 🤖 Step 3: Create Your Agent

Now, let's define and create the customer support agent. Add the following to `support_bot.py`.

```python
from knowrithm_py.services.agent import AgentService

print("\n2. Creating the Customer Support Agent...")

agent_service = AgentService(client)

agent_config = {
    "name": "Friendly Support Bot",
    "description": "A bot designed to answer customer questions based on our FAQ.",
    "personality": "You are a friendly and patient customer support representative. Your goal is to provide clear and accurate answers. Keep your responses concise and helpful.",
    "model_name": "gpt-4",
}

try:
    agent = agent_service.create(agent_config)
    agent_id = agent['id']
    print(f"✅ Agent '{agent['name']}' created with ID: {agent_id}")
except Exception as e:
    print(f"❌ Failed to create agent: {e}")
    exit()
```

---

## 📚 Step 4: Train Your Agent

An agent is only as smart as its data. Let's create a simple FAQ document to train it.

1.  **Create Training Data**: In your script, define the content for a text file.

    ```python
    print("\n3. Preparing and uploading training data...")

    faq_content = """
    Q: What are your business hours?
    A: Our support team is available 24/7 via chat. Our business offices are open from 9 AM to 6 PM, Monday to Friday.

    Q: What is your refund policy?
    A: We offer a 30-day, no-questions-asked money-back guarantee on all our plans.

    Q: How do I upgrade my plan?
    A: You can upgrade your plan at any time from your account dashboard under the 'Billing' section.
    """

    with open("faq.txt", "w") as f:
        f.write(faq_content)
    ```

2.  **Upload the Document**: Use the `DocumentService` to upload the file and associate it with your agent.

    ```python
    import time
    from knowrithm_py.services.document import DocumentService

    document_service = DocumentService(client)

    try:
        doc = document_service.upload(file_path="faq.txt", agent_id=agent_id)
        print(f"✅ Document 'faq.txt' uploaded. Processing has started.")
        
        # Wait a few seconds for processing to complete for this small file
        print("⏳ Waiting for processing...")
        time.sleep(10)
        
        status = document_service.get_processing_status(doc['id'])
        if status.get('status') == 'completed':
            print("✅ Document processing complete!")
        else:
            print("⚠️ Document is still processing. Answers may not be available yet.")
            
    except Exception as e:
        print(f"❌ Failed to upload document: {e}")
        exit()
    ```

---

## 💬 Step 5: Chat with Your Agent

It's time to test your agent! Let's create a conversation and ask it some questions.

```python
from knowrithm_py.services.conversation import ConversationService, MessageService

print("\n4. Starting a conversation...")

conversation_service = ConversationService(client)
message_service = MessageService(client)

conversation = conversation_service.create(agent_id=agent_id, entity_type="USER")
conversation_id = conversation['id']

test_questions = [
    "What is your refund policy?",
    "When are you open?",
    "How can I change my plan?"
]

for question in test_questions:
    print(f"\n👤 You: {question}")
    response = message_service.send_message(
        conversation_id=conversation_id,
        content=question,
        role="user"
    )
    print(f"🤖 Agent: {response['content']}")
```

---

## 🚀 Run Your Script

Save your `support_bot.py` file and run it from your terminal:

```bash
python support_bot.py
```

You should see output similar to this:

```
1. Initializing Knowrithm client...
✅ Client initialized successfully!

2. Creating the Customer Support Agent...
✅ Agent 'Friendly Support Bot' created with ID: agent_...

3. Preparing and uploading training data...
✅ Document 'faq.txt' uploaded. Processing has started.
⏳ Waiting for processing...
✅ Document processing complete!

4. Starting a conversation...

👤 You: What is your refund policy?
🤖 Agent: We offer a 30-day, no-questions-asked money-back guarantee on all our plans.

👤 You: When are you open?
🤖 Agent: Our support team is available 24/7 via chat. Our business offices are open from 9 AM to 6 PM, Monday to Friday.

👤 You: How can I change my plan?
🤖 Agent: You can upgrade your plan at any time from your account dashboard under the 'Billing' section.
```

---

## 🎉 Congratulations!

You've successfully built and trained your first AI agent! You now have a working chatbot that can answer questions based on the knowledge you provided.

## 下一步

Now that you have a basic agent, you can explore more advanced features:

- **Train with More Data**: Upload more complex documents like PDFs or connect a database.
  {% page-ref page="document-processing.md" %}
- **Integrate with Your Website**: Add your new agent to your website with a simple chat widget.
  {% page-ref page="../integrations/website-widget.md" %}
- **Track Performance**: Dive into the analytics dashboard to see how your agent is performing.
  {% page-ref page="advanced-analytics.md" %}
- **Manage Leads**: Configure your agent to capture and qualify leads.
  {% page-ref page="../python-sdk/leads.md" %}

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; color: white; text-align: center; margin: 32px 0;">

**Ready for the next step?**

Learn to Process Different Document Types • Explore Advanced Analytics

</div>
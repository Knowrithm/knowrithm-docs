# Getting Started with Knowrithm

Welcome to Knowrithm! This guide will help you set up your development environment and create your first AI agent in just a few minutes.

## What You'll Learn

By the end of this section, you'll be able to:

- Install and configure the Knowrithm Python SDK
- Authenticate with the Knowrithm API
- Create your first AI agent
- Upload documents and train your agent
- Start conversations and get responses

---

## Prerequisites

Before you begin, make sure you have:

- **Python 3.8 or higher** installed on your system
- A **Knowrithm account** ([Sign up here](https://app.knowrithm.org/register))
- Your **API credentials** (available in your dashboard)
- Basic familiarity with Python and REST APIs

{ hint style="info" }
**New to Python?** No problem! We'll guide you through each step. Consider checking out the [Python Tutorial](https://docs.python.org/3/tutorial/) if you need a refresher.
{ endhint }

---

## Installation Options

Choose the installation method that works best for your setup:

{ tabs }
{ tab title="Python Package (Recommended)" }
The easiest way to get started is with our Python SDK:

```bash
# Install the Knowrithm Python SDK
pip install knowrithm-py

# Verify installation
python -c "import knowrithm_py; print('Installation successful!')"
```

**Requirements:**
- Python 3.8+
- pip (Python package installer)
{ endtab }

{ tab title="Docker" }
For containerized development:
 
```bash
# Clone the repository
git clone https://github.com/Knowrithm/knowrithm-platform.git
cd knowrithm-platform

# Start with Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Requirements:**
- Docker 20.10+
- Docker Compose 1.29+
{ endtab }

{ tab title="From Source" }
For development and contributions:
 
```bash
# Clone the SDK repository
git clone https://github.com/Knowrithm/knowrithm-py.git
cd knowrithm-py

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e .

# Run tests to verify
python -m pytest tests/
```
{ endtab }
{ endtabs }

---

## Getting Your API Credentials

1. **Sign up** for a Knowrithm account at [app.knowrithm.org](https://app.knowrithm.org/register)
2. **Verify your email** and complete your profile
3. **Navigate to Settings** → **API Keys** in your dashboard
4. **Create a new API key** with the following permissions:
   - Read/Write access to Agents
   - Read/Write access to Documents
   - Read/Write access to Conversations

{ hint style="warning" }
**Keep your API credentials secure!** Never commit them to version control. Use environment variables or a secure configuration management system.
{ endhint }

---

## Quick Verification

Let's verify your setup with a simple test.

```python
# test_connection.py
import os
from knowrithm_py.client import KnowrithmClient

# Initialize client (replace with your credentials)
client = KnowrithmClient( 
    api_key="your-api-key",
    api_secret="your-api-secret",
    base_url="https://app.knowrithm.org"
)

# Test connection
try:
    user_profile = client.auth.get_profile()
    print("Connected successfully!")
    print(f"Hello, {user_profile['first_name']}!")
except Exception as e:
    print(f"Connection failed: {e}")
```

Run the test:
```bash
python test_connection.py
```

If you see the success message, you're ready to proceed!

---

## Development Environment Setup

### Virtual Environment (Recommended)

Using a virtual environment keeps your project dependencies isolated:

```bash
# Create virtual environment
python -m venv knowrithm-env

# Activate virtual environment
# On macOS/Linux:
source knowrithm-env/bin/activate
# On Windows:
knowrithm-env\Scripts\activate

# Install Knowrithm SDK
pip install knowrithm-py

# Create requirements file
pip freeze > requirements.txt
```

### Environment Variables

Create a `.env` file to store your credentials securely:

```bash
# .env file
KNOWRITHM_API_KEY=your-api-key-here
KNOWRITHM_API_SECRET=your-api-secret-here
KNOWRITHM_BASE_URL=https://app.knowrithm.org
```

Then load them in your Python code:

```python
import os
from dotenv import load_dotenv
from knowrithm_py.client import KnowrithmClient

# Load environment variables
load_dotenv()

# Initialize client
client = KnowrithmClient(
    api_key=os.getenv('KNOWRITHM_API_KEY'),
    api_secret=os.getenv('KNOWRITHM_API_SECRET'),
    base_url=os.getenv('KNOWRITHM_BASE_URL')
)
```

---

## ⚡ Your First 5 Minutes

Ready for a quick win? Here's what you can accomplish in just 5 minutes:

### Step 1: Initialize Client (30 seconds)
```python
from knowrithm_py.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
)
```

### Step 2: Create an Agent (1 minute)
```python
agent = client.agents.create({
    "name": "My First Bot",
    "description": "A helpful customer service assistant",
    "personality": "friendly and professional"
})
print(f"Agent created: {agent['name']}")
```

### Step 3: Start a Conversation (30 seconds)
```python
conversation = client.conversations.create(
    agent_id=agent['id'],
    entity_type="USER"
)
print(f"Conversation started: {conversation['id']}")
```

### Step 4: Send a Message (1 minute)
```python
response = client.messages.send_message(
    conversation_id=conversation['id'],
    content="Hello! Can you help me with a question?",
    role="user"
)
print(f"Bot replied: {response['content']}")
```

### Step 5: Celebrate! (2 minutes)
You've just created your first AI agent and had a conversation with it! 🎉

---

## Next Steps

Now that you have the basics working, you can:

1. **[Learn Authentication](authentication.md)** - Understand API security and token management
2. **[Follow the Quick Start Tutorial](quick-start.md)** - Build a complete example step-by-step
3. **[Explore the Python SDK](../python-sdk/)** - Dive deep into all available features
4. **[Check out Examples](../tutorials/)** - See real-world use cases and implementations

---

## Need Help?

If you run into any issues:

- Check our [FAQ](../resources/faq.md) for common solutions
- Visit our [Troubleshooting Guide](../resources/troubleshooting.md)
- Join our [Discord Community](https://discord.gg/cHHWfghJrR)
- Email our support team: support@knowrithm.org

---

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; color: white; text-align: center; margin: 32px 0;">

**Ready to build something amazing?**

[Continue to Quick Start Tutorial](quick-start.md)

</div>
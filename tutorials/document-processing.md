# Tutorial: Advanced Document Processing 📄

This tutorial will guide you through training your AI agent with various document types, including PDFs and structured data like CSV files. You'll learn how to upload documents, monitor their processing, and use them to answer complex questions.

---

## 🎯 What You'll Learn

- How to upload different file formats (PDF, TXT, CSV) to train an agent.
- How to monitor the asynchronous document processing task.
- How to perform semantic searches across your entire knowledge base.
- Best practices for preparing your data for optimal performance.

---

## 📋 Prerequisites

Before you begin, ensure you have:
- Completed the [Building Your First Agent](building-first-agent.md) tutorial.
- An active Agent ID to associate your documents with.
- The Knowrithm Python SDK installed and configured with your API credentials.

---

## 🛠️ Step 1: Project Setup

Let's create a new script for this tutorial.

1.  In your project folder, create a new file named `doc_processing_tutorial.py`.
2.  Add the initial client setup code:

    ```python
    # doc_processing_tutorial.py
    import os
    import time
    from dotenv import load_dotenv
    from knowrithm_py.knowrithm.client import KnowrithmClient
    from knowrithm_py.services.agent import AgentService
    from knowrithm_py.services.document import DocumentService
    from knowrithm_py.services.conversation import ConversationService, MessageService

    # Load environment variables
    load_dotenv()

    # Initialize client
    client = KnowrithmClient(
        api_key=os.getenv("KNOWRITHM_API_KEY"),
        api_secret=os.getenv("KNOWRITHM_API_SECRET"),
    )

    # --- Use the Agent ID from the previous tutorial or create a new one ---
    # agent_id = "your-existing-agent-id"
    # For this tutorial, we'll create a new one to keep it self-contained.
    agent_service = AgentService(client)
    agent = agent_service.create({
        "name": "Document Expert Agent",
        "description": "An agent trained on multiple document types."
    })
    agent_id = agent['id']
    print(f"✅ Using Agent ID: {agent_id}")
    ```

---

## 📄 Step 2: Uploading Unstructured Data (PDF/TXT)

Unstructured data like PDFs and text files are perfect for knowledge bases, FAQs, and manuals.

1.  **Create a Sample Policy Document**: Create a file named `company_policy.txt`.

    ```text
    Our company offers a premium warranty for all enterprise-level products.
    This warranty covers hardware defects for a period of three years from the date of purchase.
    Standard products come with a one-year warranty.
    Software updates are provided for free during the warranty period.
    ```

2.  **Upload the Document**: Add this code to your Python script.

    ```python
    document_service = DocumentService(client)

    print("\nUploading company_policy.txt...")
    try:
        policy_doc = document_service.upload(
            file_path="company_policy.txt",
            agent_id=agent_id,
            metadata={"document_type": "policy", "version": "1.3"}
        )
        print(f"✅ 'company_policy.txt' uploaded with ID: {policy_doc['id']}")
    except Exception as e:
        print(f"❌ Error uploading policy document: {e}")
        exit()
    ```

---

## 📊 Step 3: Uploading Structured Data (CSV)

Knowrithm can also process structured data. Each row in a CSV is treated as a distinct piece of information, which is great for product catalogs, user lists, or pricing tables.

1.  **Create a Sample Product Catalog**: Create a file named `products.csv`.

    ```csv
    ProductID,ProductName,Price,Stock
    P001,Quantum Widget,99.99,150
    P002,Hyper-Sprocket,149.50,75
    P003,Nano-Gear,45.00,300
    P004,Omega-Drive,299.99,40
    ```

2.  **Upload the CSV File**:

    ```python
    print("\nUploading products.csv...")
    try:
        products_doc = document_service.upload(
            file_path="products.csv",
            agent_id=agent_id,
            metadata={"document_type": "catalog"}
        )
        print(f"✅ 'products.csv' uploaded with ID: {products_doc['id']}")
    except Exception as e:
        print(f"❌ Error uploading product catalog: {e}")
        exit()
    ```

---

## ⚙️ Step 4: Monitor Processing

Since processing is asynchronous, it's good practice to wait for it to complete before querying the agent.

```python
def wait_for_processing(doc_id, timeout=120):
    print(f"Waiting for document {doc_id} to be processed...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        status = document_service.get_processing_status(doc_id)
        if status.get('status') == 'completed':
            print(f"✅ Document {doc_id} processed successfully.")
            return True
        if status.get('status') == 'failed':
            print(f"❌ Document {doc_id} failed processing.")
            return False
        time.sleep(5)
    print("⌛️ Processing timed out.")
    return False

wait_for_processing(policy_doc['id'])
wait_for_processing(products_doc['id'])
```

---

## 💬 Step 5: Chat with Your Newly Trained Agent

Now that the agent has been trained on both documents, let's ask it questions that require information from each.

```python
print("\nStarting conversation with the document expert agent...")
conversation_service = ConversationService(client)
message_service = MessageService(client)

conversation = conversation_service.create(agent_id=agent_id, entity_type="USER")

questions = [
    "What is the warranty on enterprise products?",
    "How much does the Hyper-Sprocket cost?",
    "Tell me about the warranty for the Omega-Drive."
]

for question in questions:
    print(f"\n👤 You: {question}")
    response = message_service.send_message(
        conversation_id=conversation['id'],
        content=question,
        role="user"
    )
    print(f"🤖 Agent: {response['content']}")
```

### Expected Output

Your agent should now be able to answer questions by combining information from both documents:

> **You**: Tell me about the warranty for the Omega-Drive.
>
> **Agent**: The Omega-Drive is an enterprise-level product and comes with a premium warranty that covers hardware defects for three years from the date of purchase.

---

## 🎉 Congratulations!

You have successfully trained an agent on multiple, distinct data sources! You've learned how to:
- Upload both unstructured (TXT) and structured (CSV) data.
- Monitor the processing status of your documents.
- Ask questions that require the agent to synthesize information from its entire knowledge base.

## Next Steps

-   **Connect a Live Database**: Instead of a static CSV, connect a live database for real-time data.
    Database Integration Tutorial
-   **Explore Search**: Use the `document_service.search()` method to perform targeted semantic searches against your knowledge base outside of a conversation.
-   **Use Metadata**: Try searching with the metadata filters you added, e.g., `filters={"document_type": "catalog"}`.
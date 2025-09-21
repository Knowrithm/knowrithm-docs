# Document Processing 📚

This guide covers how to use the `DocumentService` to upload, manage, and search through documents, which form the core knowledge base for your AI agents.

## 🎯 What is Document Processing?

Document processing is the mechanism by which Knowrithm ingests your business data, breaks it down into searchable pieces (chunks), and converts it into a format that AI agents can understand and use to answer questions. A well-curated set of documents is the key to building a smart and accurate agent.

### Supported Formats

Knowrithm supports a wide range of document formats:
- **PDF**: Including text-based and scanned documents (with OCR).
- **DOCX**: Microsoft Word documents.
- **TXT**: Plain text files.
- **CSV / JSON**: Structured data files.
- **XML**: Extensible Markup Language files.

---

## 🚀 Uploading a Document

Uploading a document is the first step in training an agent. Each document must be associated with an agent.

```python
from knowrithm_py.services.document import DocumentService

document_service = DocumentService(client)

# The agent_id tells Knowrithm which agent to train with this document.
agent_id = "your-agent-id"

try:
    doc = document_service.upload(
        file_path="./knowledge_base/product-faq.pdf",
        agent_id=agent_id,
        metadata={
            "document_type": "faq",
            "version": "2.1",
            "author": "support_team"
        }
    )
    print(f"✅ Document '{doc['filename']}' uploaded successfully.")
    print(f"📄 Document ID: {doc['id']}")
    print(f"⏳ Status: {doc['status']}")

except FileNotFoundError:
    print("❌ Error: The file was not found at the specified path.")
except Exception as e:
    print(f"❌ An error occurred during upload: {e}")
```

---

## ⚙️ Checking Processing Status

Document processing is an asynchronous task. After uploading, you can poll the status to know when it's ready.

```python
import time

def wait_for_processing(document_id, timeout_seconds=180):
    """Polls the document status until it's completed or fails."""
    start_time = time.time()
    while time.time() - start_time < timeout_seconds:
        try:
            status_response = document_service.get_processing_status(document_id)
            status = status_response.get('status')

            if status == 'completed':
                print(f"✅ Processing complete! Chunks created: {status_response.get('chunk_count', 0)}")
                return True
            elif status == 'failed':
                print(f"❌ Processing failed. Reason: {status_response.get('error_message')}")
                return False
            else:
                progress = status_response.get('processing_progress', 0)
                print(f"⏳ Status: {status}... {progress}% complete.")
                time.sleep(5) # Wait 5 seconds before checking again

        except Exception as e:
            print(f"⚠️ Error checking status: {e}")
            time.sleep(5)
            
    print("⌛️ Processing timed out.")
    return False

# Usage
# if 'doc' in locals():
#     wait_for_processing(doc['id'])
```

---

## 🔍 Managing Documents

### Listing Documents

Retrieve a list of documents, with optional filters for agent ID and status.

```python
# List all documents for a specific agent
agent_documents = document_service.list(
    params={"agent_id": agent_id}
)
print(f"Agent {agent_id} has {len(agent_documents)} documents.")

# List all documents currently being processed
processing_docs = document_service.list(
    params={"status": "processing"}
)
print(f"Found {len(processing_docs)} documents in processing state.")
```

### Searching Within Documents

Once documents are processed, you can perform a semantic search across the knowledge base of one or more agents.

```python
query = "What is the warranty period for enterprise products?"

search_results = document_service.search(
    query=query,
    filters={
        "agent_id": agent_id,
        "document_type": "faq" # Filter by metadata
    },
    limit=3 # Get the top 3 most relevant results
)

print(f"Found {len(search_results)} results for '{query}':")
for i, result in enumerate(search_results):
    print(f"\n{i+1}. Score: {result['score']:.2f} (Source: {result['source_filename']})")
    print(f"   Chunk: \"{result['content'][:150]}...\"")
```

### Deleting and Restoring Documents

Documents can be soft-deleted and restored.

```python
document_id_to_delete = "doc_12345"

# Soft-delete a document
document_service.delete(document_id_to_delete)
print(f"Document {document_id_to_delete} has been deleted.")

# Restore it
document_service.restore(document_id_to_delete)
print(f"Document {document_id_to_delete} has been restored.")
```

---

## ✨ Advanced Operations

### Reprocessing a Document

If you've updated your document or if our processing engine has been improved, you can trigger a reprocess.

```python
reprocess_result = document_service.reprocess(document_id_to_delete)
print(f"Document reprocessing started. Status: {reprocess_result.get('status')}")
```

### Managing Chunks

Documents are broken into smaller "chunks" for efficient searching. You can inspect these chunks.

```python
# List all chunks for a document
chunks = document_service.list_chunks(document_id_to_delete)
print(f"Document contains {len(chunks)} chunks.")

# You can also delete or restore individual chunks if needed
if chunks:
    chunk_id_to_delete = chunks[0]['id']
    # document_service.delete_chunk(chunk_id_to_delete)
```

### OCR for Scanned Documents

Knowrithm automatically detects if a PDF contains scanned images and applies Optical Character Recognition (OCR) to extract the text. No special configuration is needed, but for best results, ensure your scanned documents are high-resolution (300 DPI or higher).

---

## 💡 Best Practices

- **Clean Your Data**: Before uploading, ensure your documents are well-structured and free of irrelevant headers, footers, or artifacts. The cleaner the source, the better the agent's answers.
- **Be Descriptive**: Use clear, descriptive filenames (e.g., `2024-q1-pricing-sheet.pdf` instead of `doc1.pdf`).
- **Use Metadata**: Attach metadata during upload to enable powerful filtering during search. Good metadata keys include `document_type`, `version`, `department`, or `last_updated`.
- **One Topic Per Document**: Prefer smaller, focused documents over large, monolithic ones. An agent can be trained on many documents, so splitting a 500-page manual into logical chapters can improve search relevance.
- **Update Regularly**: Keep your agent's knowledge fresh by re-uploading or creating new documents as your business information changes.

---

## 🔧 Full Example: Document Lifecycle

This script demonstrates the end-to-end process of managing a document.

```python
import os
import time
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.services.document import DocumentService
from knowrithm_py.services.agent import AgentService

def document_lifecycle_example(client: KnowrithmClient, agent_id: str):
    """Demonstrates the full document lifecycle."""
    document_service = DocumentService(client)
    
    # 1. Create a dummy document
    file_path = "test_doc.txt"
    with open(file_path, "w") as f:
        f.write("Knowrithm is an AI platform. It helps build intelligent agents.")
    
    # 2. Upload the document
    print("Uploading document...")
    doc = document_service.upload(file_path=file_path, agent_id=agent_id)
    doc_id = doc['id']
    print(f"Document '{doc['filename']}' uploaded with ID: {doc_id}")

    # 3. Wait for processing
    print("\nWaiting for processing to complete...")
    # In a real app, use a robust polling function like the one above.
    time.sleep(10) 
    status = document_service.get_processing_status(doc_id)
    if status.get('status') != 'completed':
        print("Warning: Document may not be fully processed.")
        return
    print("Processing complete.")

    # 4. List documents for the agent
    print("\nListing agent's documents...")
    docs = document_service.list(params={"agent_id": agent_id})
    print(f"Found {len(docs)} document(s) for this agent.")

    # 5. Search within the document
    print("\nSearching for 'AI platform'...")
    results = document_service.search(query="AI platform", filters={"agent_id": agent_id})
    if results:
        print(f"Found search result: '{results[0]['content']}'")
    else:
        print("No search results found.")

    # 6. Delete the document
    print(f"\nDeleting document {doc_id}...")
    document_service.delete(doc_id)
    print("Document deleted.")

    # Verify it's gone from the main list
    docs_after_delete = document_service.list(params={"agent_id": agent_id})
    print(f"Documents found after deletion: {len(docs_after_delete)}")

    # 7. Restore the document
    print(f"\nRestoring document {doc_id}...")
    document_service.restore(doc_id)
    docs_after_restore = document_service.list(params={"agent_id": agent_id})
    print(f"Documents found after restore: {len(docs_after_restore)}")

    # 8. Clean up
    document_service.delete(doc_id)
    os.remove(file_path)
    print("\nLifecycle example complete. Resources cleaned up.")

# To run this example:
# 1. Make sure 'client' is an initialized KnowrithmClient.
# 2. Create an agent first to get an 'agent_id'.
# agent_service = AgentService(client)
# my_agent = agent_service.create({"name": "Doc Test Agent", "description": "..."})
# document_lifecycle_example(client, my_agent['id'])
```

---

## Next Steps

- **Explore Conversations**: Learn how to chat with your newly trained agent.
  {% content-ref url="conversations.md" %}
- **Connect a Database**: Enhance your agent's knowledge with live data.
  {% content-ref url="../tutorials/database-integration.md" %}
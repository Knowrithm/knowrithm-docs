# System Architecture

This document provides a detailed overview of the Knowrithm platform's technical architecture, including its components, data flow, and technology stack.

---

## Architectural Goals

The Knowrithm platform is designed with the following key principles in mind:

- **Scalability**: To handle thousands of concurrent agents and conversations without performance degradation.
- **Reliability**: To ensure high availability and data integrity for mission-critical applications.
- **Security**: To provide robust data isolation and protection in a multi-tenant environment.
- **Extensibility**: To allow for easy integration of new AI models, data sources, and third-party services.

---

## System Components

The platform is composed of several interconnected microservices and components, each with a specific responsibility.

```mermaid
graph TD
    subgraph "Client Layer"
        WEB[Web Dashboard]
        API[REST API]
        SDK[Python SDK]
        WIDGET[Chat Widget]
    end
    
    subgraph "Application Layer"
        AUTH[Authentication Service]
        AGENT[Agent Management]
        CONV[Conversation Engine]
        WORKERS[Background Workers <br/> (Celery)]
        ANALYTICS[Analytics Engine]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache & Queue)]
        S3[(Object Storage)]
        VECTOR[(Vector Database)]
    end
    
    subgraph "AI/ML Layer"
        LLM[Large Language Models]
        EMBED[Embedding Models]
    end
    
    WEB & API & SDK & WIDGET --> AUTH;
    AUTH --> AGENT & CONV & ANALYTICS;
    AGENT & CONV --> WORKERS;
    
    AGENT & ANALYTICS --> POSTGRES;
    CONV --> REDIS;
    WORKERS --> S3 & VECTOR;
    
    CONV --> LLM;
    WORKERS --> EMBED;
```

### Component Descriptions

-   **Authentication Service**: Handles user login, JWT management, and API key authentication.
-   **Agent Management**: Manages the lifecycle (CRUD) of AI agents and their configurations.
-   **Conversation Engine**: Manages active conversations, maintains context, and interacts with the AI/ML layer to generate responses.
-   **Background Workers (Celery)**: Asynchronously handles long-running tasks like document processing, OCR, embedding generation, and database analysis.
-   **Analytics Engine**: Collects, aggregates, and serves performance metrics for agents, conversations, and leads.
-   **PostgreSQL**: The primary relational database for storing structured data like user accounts, agent configurations, and conversation metadata.
-   **Redis**: Used as both a high-performance cache for frequently accessed data and as a message broker for Celery tasks.
-   **Object Storage (S3-compatible)**: Stores uploaded documents, training data, and other large binary files securely.
-   **Vector Database**: Stores vector embeddings of document chunks, enabling fast and efficient semantic search.
-   **AI/ML Layer**: Interfaces with large language models (like Gemini) for response generation and embedding models for data processing.

---

## Data Flow

### Document Processing Flow

1.  A user uploads a document via the API or web dashboard.
2.  The file is saved to secure Object Storage.
3.  A task is added to the Celery queue.
4.  A Celery worker picks up the task, retrieves the document, and extracts its text (using OCR if necessary).
5.  The text is split into logical, overlapping chunks.
6.  Each chunk is passed to an Embedding Model to generate a vector representation.
7.  The chunk text and its corresponding vector are stored in the Vector Database, linked to the agent's ID.

### Conversation Flow

1.  A user sends a message to an agent.
2.  The Conversation Engine retrieves the recent conversation history from Redis to provide context.
3.  The user's query is converted into a vector embedding.
4.  This embedding is used to search the Vector Database for the most relevant document chunks (knowledge retrieval).
5.  The user's query, conversation history, and retrieved knowledge are combined into a prompt.
6.  The prompt is sent to the Large Language Model (LLM).
7.  The LLM generates a response, which is streamed back to the user.
8.  The new user message and agent response are saved to the conversation history in Redis and persisted in PostgreSQL.

---

## Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| **Backend Framework** | Flask (Python) | Core application logic and REST API. |
| **Primary Database** | PostgreSQL | Storing relational data (users, agents, etc.). |
| **ORM** | SQLAlchemy | Database interaction and schema management. |
| **Cache & Queue** | Redis | Caching session data and as a Celery message broker. |
| **Background Tasks** | Celery | Asynchronous processing of documents and analytics. |
| **AI/ML Integration** | Gemini API | Language model for responses and embeddings. |
| **Text Extraction** | Tesseract OCR | Extracting text from scanned documents and images. |
| **Containerization** | Docker | Packaging the application for consistent deployment. |
| **Orchestration** | Kubernetes | Scaling and managing the platform in production. |

---

## Scalability & Performance

The platform is designed to scale horizontally to meet demand.

-   **Stateless Application Layer**: The main Flask application is stateless, allowing multiple instances to run behind a load balancer.
-   **Celery Worker Scaling**: The number of Celery workers can be increased independently to handle higher loads of document processing and other background tasks.
-   **Database Read Replicas**: The system can be configured to use PostgreSQL read replicas for analytics queries, reducing the load on the primary database.
-   **Connection Pooling**: We use SQLAlchemy's connection pooling to efficiently manage and reuse database connections.
-   **Redis Caching**: Caching frequently accessed data (like conversation history and agent configurations) in Redis significantly reduces database lookups and improves response times.

---

## Multi-Tenancy

Security and data isolation are achieved through a strict multi-tenancy model.

-   **Logical Data Separation**: Every key table in the database (e.g., `agents`, `documents`, `conversations`) has a `company_id` column.
-   **API-Level Enforcement**: All API requests are validated to ensure a user can only access resources belonging to their own company.
-   **Isolated Knowledge Bases**: Document chunks and database schemas are indexed with their respective `agent_id` and `company_id`, ensuring that one agent cannot access another company's data.

---

## Next Steps

- **Deployment Guide**: Learn how to deploy this architecture.
  Deployment Guide
- **Security Guide**: Understand the security measures in place.
  Security Guide
- **Monitoring Guide**: Learn how to monitor the health and performance of the platform.
  Monitoring Guide
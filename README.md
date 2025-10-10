<img width="999" height="562" alt="20250925_2353_Futuristic Knowrithm Logo_simple_compose_01k616ywakf1r91ekdeb54xy9p - Edited" src="https://github.com/user-attachments/assets/f414f249-776d-4d47-b1bc-e28d63ade7cc" />

# Knowrithm (Enterprise Multi-Agent Chatbot Platform)

A comprehensive Flask-based platform that enables companies to create, train, and deploy intelligent chatbot agents with advanced natural language processing capabilities, multi-source data integration, and enterprise-grade scalability.

## Platform Overview

This enterprise solution empowers organizations to:
- Create multiple AI agents tailored to specific business functions
- Train agents on documents, databases, and web content
- Serve customers across digital touchpoints
- Manage users, leads, and analytics at scale

## Core Features

### Multi-Agent Management
- Create specialized chatbot agents per company
- Train each agent on dedicated knowledge sources
- Keep knowledge bases and context isolated per agent
- Monitor agent performance and interactions

### Company and Lead Management
- End-to-end company registration and lifecycle management
- Lead registration workflows and analytics
- Lead conversion tracking and reporting
- Multi-tenant architecture with data isolation

### Advanced Data Integration
- Document ingestion for XML, TXT, DOCX, PDF, CSV, and JSON
- Database connections for PostgreSQL, MySQL, SQLite, and MongoDB
- OCR pipeline using Tesseract for scanned content
- Website scraping and ingestion for training material
- Vector-based semantic search for retrieval

### Enterprise Security
- Multi-level authentication for admins, companies, and leads
- JWT-based access control with scoped API keys
- Strict data isolation per company and agent
- Comprehensive audit logging

### Analytics and Monitoring
- Real-time dashboards and usage analytics
- Lead conversion funnel tracking
- Agent performance metrics and satisfaction scores
- System health monitoring for infrastructure

## Technical Architecture

### Technology Stack
- Backend: Flask (Python 3.11+)
- Database: PostgreSQL with SQLAlchemy ORM
- Cache and Queue: Redis and Celery
- AI and ML: Gemini integration with custom embeddings
- Search: Vector similarity search for semantic retrieval
- OCR: Tesseract-based extraction

### Infrastructure Components
- Celery workers for asynchronous training and analysis jobs
- Redis for caching and task brokering
- Connection pooling for efficient database access
- Background processing for document parsing and analytics generation

## API Documentation

### Authentication and Headers

- JWT access tokens: send `Authorization: Bearer <token>`. Role-based decorators still apply, and some routes require JWT.
- API keys: include both `X-API-Key` and `X-API-Secret`. Scopes such as `read`, `write`, or `admin` must be granted before access.
- Unless a route explicitly states otherwise, assume one of the two authentication strategies is required. When both are listed, either works.

### Endpoint Catalogue

**Authentication and User Accounts**
- `POST /v1/auth/register` - register a company admin (public).
- `POST /v1/auth/user` - create a user for the current company (admin or scoped API key).
- `POST /v1/auth/login` - issue JWT access and refresh tokens.
- `GET /v1/auth/user/me` - fetch the authenticated user and active company.
- `POST /v1/auth/logout` - revoke the active JWT session.
- `POST /v1/auth/refresh` - rotate access and refresh tokens.
- `POST /v1/send` and `POST /v1/verify` - email verification flow.
- `GET /v1/user/<user_id>` - fetch a user within company scope.
- `GET /v1/user/profile` and `PUT /v1/user/profile` - manage the current user profile.
- `GET /v1/auth/super-admin` - seed the platform super admin from environment configuration.

**Admin and Governance**
- `GET /v1/admin/user` and `GET /v1/super-admin/company/<company_id>/user` - paginated user catalogues with advanced filtering.
- `GET /v1/admin/user/<user_id>` - retrieve a user within the current company.
- `GET /v1/admin/system-metric` and `GET /v1/super-admin/company/<company_id>/system-metric` - infrastructure metrics.
- `GET /v1/audit-log` - audit log browser with filtering.
- `GET /v1/config` and `PATCH /v1/config` - system configuration management.
- `POST /v1/user/<user_id>/force-password-reset` - dispatch password reset notifications.
- `POST /v1/user/<user_id>/impersonate` - impersonation token flow (super admin only).
- `PATCH /v1/user/<user_id>/status` and `PATCH /v1/user/<user_id>/role` - manage user lifecycle and roles.

**Company Operations**
- `POST /v1/company` - create a company via JSON or multipart payloads.
- `GET /v1/company` - retrieve the authenticated company.
- `GET /v1/super-admin/company` - super admin company list with pagination.
- `GET /v1/company/<company_id>/statistics` and `GET /v1/company/statistics` - lead conversion metrics.
- `DELETE /v1/company/<company_id>` and `PATCH /v1/company/<company_id>/restore` - soft delete or restore a company.
- `GET /v1/company/deleted` - view soft-deleted companies.
- `DELETE /v1/company/bulk-delete` and `PATCH /v1/company/bulk-restore` - bulk lifecycle management.
- `GET /v1/company/<company_id>/related-data` - inspect related data before deletion (super admin).
- `DELETE /v1/company/<company_id>/cascade-delete` - cascade soft delete with optional related data handling.
- `PUT /v1/company/<company_id>` and `PATCH /v1/company/<company_id>` - update company metadata.

**Agent Management**
- `POST /v1/agent` - create an agent with company or agent-level LLM settings.
- `GET /v1/agent` - list agents with filtering, pagination, and search.
- `GET /v1/agent/<agent_id>` - public agent retrieval.
- `PUT /v1/agent/<agent_id>` - update agent configuration.
- `DELETE /v1/agent/<agent_id>` and `PATCH /v1/agent/<agent_id>/restore` - lifecycle management.
- `GET /v1/agent/<agent_id>/embed-code` - retrieve embeddable widget code.
- `POST /v1/agent/<agent_id>/test` - execute test prompts.
- `GET /v1/agent/<agent_id>/stats` - aggregate performance metrics.
- `POST /v1/agent/<agent_id>/clone` - duplicate an agent configuration.
- `GET /widget.js` - public chat widget script.
- `POST /test` - render a test page with the widget.

**Conversations and Messaging**
- `POST /v1/conversation` - start a conversation bound to the current entity.
- `GET /v1/conversation` and `GET /v1/conversation/entity` - list conversations for the company or entity perspective.
- `GET /v1/conversation/<conversation_id>/messages` - paginated conversation history.
- `POST /v1/conversation/<conversation_id>/chat` - send messages and receive AI responses.
- `DELETE /v1/conversation/<conversation_id>` - soft delete a conversation.
- `DELETE /v1/conversation/<conversation_id>/messages` - remove all messages within a conversation.
- `PATCH /v1/conversation/<conversation_id>/restore` and `PATCH /v1/conversation/<conversation_id>/message/restore-all` - restore conversations and their messages.
- `DELETE /v1/message/<message_id>` and `PATCH /v1/message/<message_id>/restore` - message lifecycle operations.
- `GET /v1/conversation/deleted` and `GET /v1/message/deleted` - view soft-deleted conversations or messages.

**Leads**
- `POST /v1/lead/register` - public widget lead registration with optional conversation bootstrap.
- `POST /v1/lead` - create a lead within an authenticated company.
- `GET /v1/lead/<lead_id>` - lead detail retrieval.
- `GET /v1/lead/company` - paginated lead lists with filters.
- `PUT /v1/lead/<lead_id>` - update lead attributes.
- `DELETE /v1/lead/<lead_id>` - soft delete lead records.

**Documents and Semantic Search**
- `POST /v1/document/upload` - upload files or URLs for ingestion.
- `GET /v1/document` - list company documents.
- `DELETE /v1/document/<document_id>` and `PATCH /v1/document/<document_id>/restore` - document lifecycle.
- `DELETE /v1/document/chunk/<chunk_id>` and `PATCH /v1/document/chunk/<chunk_id>/restore` - chunk management.
- `DELETE /v1/document/<document_id>/chunk` and `PATCH /v1/document/<document_id>/chunk/restore-all` - bulk chunk operations.
- `GET /v1/document/deleted` and `GET /v1/document/chunk/deleted` - view deleted documents or chunks.
- `DELETE /v1/document/bulk-delete` - bulk document deletion.
- `POST /v1/search/document` - semantic search scoped to company and agent context.

**Database Integrations**
- `POST /v1/database-connection` - register a database connection with optional credential encryption.
- `GET /v1/database-connection` - list connections for the current user.
- `POST /v1/database-connection/<connection_id>/test` - retest connectivity for a connection.
- `POST /v1/database-connection/<connection_id>/analyze` - queue semantic analysis.
- `POST /v1/database-connection/analyze` - batch analysis of eligible connections.
- `GET /v1/database-connection/<connection_id>/table` and `GET /v1/database-connection/table/<table_id>` - inspect captured table metadata.
- `GET /v1/database-connection/<connection_id>/semantic-snapshot` - fetch the latest semantic snapshot.
- `GET /v1/database-connection/<connection_id>/knowledge-graph` - retrieve the generated knowledge graph.
- `GET /v1/database-connection/<connection_id>/sample-queries` - list AI-generated sample queries.
- `POST /v1/database-connection/<connection_id>/text-to-sql` - convert questions to SQL with optional execution.
- `POST /v1/database-connection/export` - export tables into documents.
- `DELETE /v1/database-connection/<connection_id>` and `PATCH /v1/database-connection/<connection_id>/restore` - manage connection lifecycle.
- `DELETE /v1/database-connection/table/<table_id>` and `PATCH /v1/database-connection/table/<table_id>/restore` - manage table metadata.
- `GET /v1/database-connection/deleted` and `GET /v1/database-connection/table/deleted` - view deleted records.
- `PUT /v1/database-connection/<connection_id>` and `PATCH /v1/database-connection/<connection_id>` - update connection details.
- `POST /v1/search/database` - semantic database search across connections.

**Analytics and Reporting**
- `GET /v1/analytic/dashboard` - consolidated dashboard metrics.
- `GET /v1/analytic/agent/<agent_id>` - agent analytics over a date range.
- `GET /v1/analytic/conversation/<conversation_id>` - conversation analytics.
- `GET /v1/analytic/leads` - lead funnel metrics.
- `GET /v1/analytic/usage` - platform usage metrics.
- `GET /v1/analytic/agent/<agent_id>/performance-comparison` - benchmark agents against company averages.
- `POST /v1/analytic/export` - export conversations, leads, agents, or usage logs.
- `POST /v1/system-metric` - trigger asynchronous system metric collection.
- `GET /health` - health probe (no authentication required).

**Settings and Provider Management**
- `POST /v1/settings` - create LLM settings scoped to a company or agent.
- `PUT /v1/settings/<settings_id>` and `DELETE /v1/settings/<settings_id>` - update or remove settings.
- `GET /v1/settings/<settings_id>` - retrieve a settings record.
- `GET /v1/settings/company/<company_id>` and `GET /v1/settings/agent/<agent_id>` - enumerate settings per scope.
- `POST /v1/settings/test/<settings_id>` - validate an LLM settings configuration.
- `POST /v1/providers` - manage provider metadata (create, update, delete).
- `POST /v1/providers/<provider_id>/models` - manage provider models.
- `GET /v1/providers`, `GET /v1/providers/<provider_id>`, and related model endpoints - provider catalogues.
- `POST /v1/providers/bulk-import` and `POST /v1/settings/providers/seed` - seed providers and models.

**OAuth and API Keys**
- `POST /v1/auth/api-keys` - create API keys for a JWT user.
- `GET /v1/auth/api-keys` and `DELETE /v1/auth/api-keys/<api_key_id>` - manage keys.
- `GET /v1/auth/validate` - validate credentials and return metadata.
- Analytics for API keys (`/v1/overview`, `/v1/usage-trends`, `/v1/top-endpoints`, `/v1/api-key-performance`, `/v1/error-analysis`, `/v1/rate-limit-analysis`, `/v1/detailed-usage/<api_key_id>`) - require admin scopes or roles.

**Geographic and Address Data**
- `GET /v1/address-seed` - populate reference data (public).
- Country, state, and city endpoints for creation, listing, and updates (admin or scoped API keys).
- `POST /v1/address` and `GET /v1/address` - manage company addresses.

## Installation and Setup

### Prerequisites

```bash
# System requirements
Python 3.11+
PostgreSQL 13+
Redis 6+
Tesseract OCR
```

### Quick Start with Docker

```bash
git clone <repository-url>
cd enterprise-chatbot-platform

cp .env.example .env
# Configure environment variables

docker-compose up -d
docker-compose exec app flask db upgrade

curl http://localhost:8543/health
```

### Manual Installation

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

createdb chatbot_platform
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

redis-server

celery -A app.celery worker --loglevel=info

python app.py
```

## Configuration

### Environment Variables

```env
SECRET_KEY=your-super-secret-key-here
HOST=0.0.0.0
PORT=8543

SQLALCHEMY_DATABASE_URI=postgresql://user:password@db:5432/database
POSTGRES_DB=database
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_HOST=db
POSTGRES_PORT=5432

JWT_SECRET_KEY=your-jwt-secret-key

UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=52428800

REDIS_URL=redis://redis:6379/0

SMTP_SERVER=smtp-server
SMTP_SENDER=sender-email
SMTP_PORT=587
SMTP_USERNAME=username
SMTP_PASSWORD=password
RESEND_API_KEY=api-key

ENCRYPTION_KEY=generated-fernet-key

CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

SUPER_ADMIN_EMAIL=superadmin@email.com
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_FIRST_NAME=superadmin
SUPER_ADMIN_LAST_NAME=superadmin
SUPER_ADMIN_PASSWORD=yourpassword

CF_DNS_API_TOKEN=cf-dns-api-token
JS_SCRIPT=static/js/agent-widget.js
BASE_URL=http://localhost:8543

AWS_ACCESS_KEY_ID=aws-access-key-id
AWS_SECRET_ACCESS_KEY=aws-secret-access-key
AWS_REGION=aws-region
S3_BUCKET_NAME=aws-bucket-name
```

### Database Configuration

```text
Supported database types
- PostgreSQL
- MySQL
- SQLite
- MongoDB

Example connection strings
postgresql://user:pass@localhost:5432/database
mysql://user:pass@localhost:3306/database
sqlite:///path/to/database.db
mongodb://user:pass@localhost:27017/database
```

## Platform Architecture

### Multi-Tenant Design

```
Company A                    Company B
|- Agent 1 (Sales)           |- Agent 1 (Support)
|- Agent 2 (Support)         |- Agent 2 (Technical)
|- Documents                 |- Documents
|- Database Connections      |- Database Connections
`- Leads                     `- Leads
```

### Data Flow

```
1. Company uploads documents or connects databases
2. Background workers process and generate embeddings
3. Agents train on company-specific data
4. Leads interact with agents through conversations
5. Analytics track performance and conversions
```

### Scalability Features
- Horizontal scaling with multiple Celery workers
- Database optimization via connection pooling
- Redis caching for hot data
- Load balancing across Flask instances

## Testing

```bash
pip install -r requirements-test.txt

pytest
pytest --cov=app --cov-report=html
pytest tests/test_auth.py -v
pytest tests/test_agents.py -v
pytest tests/test_conversations.py -v
```

API smoke tests:

```bash
curl http://localhost:8543/health

curl -X POST http://localhost:8543/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## Deployment

### Production Deployment

```bash
docker build -t chatbot-platform:latest .
docker-compose -f docker-compose.prod.yml up -d

chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Nginx Configuration

```nginx
upstream chatbot_app {
    server 127.0.0.1:8543;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    client_max_body_size 20M;

    location / {
        proxy_pass http://chatbot_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /path/to/static/files;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Monitoring and Analytics

### System Metrics
- Performance: response time, throughput, error rates
- Resources: CPU, memory, disk, database connections
- Business: lead conversions, agent utilization, engagement

### Health Monitoring

```bash
GET /health

Response:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "celery": "running"
}
```

### Logging
- ERROR: system failures
- WARNING: performance anomalies
- INFO: user actions and events
- DEBUG: verbose diagnostic data

## Security Features

### Authentication and Authorization
- JWT tokens with scoped roles
- Role-based access for admin, company, and lead personas
- Secure session handling with configurable timeouts

### Data Protection
- Input sanitization for API requests
- Encryption of sensitive data at rest
- Secure headers to mitigate web security risks
- Rate limiting to prevent abuse

### Audit and Compliance
- Full activity logging
- Data isolation per company
- GDPR-aligned export and deletion workflows

## Performance Optimization

### Database Optimization

```sql
CREATE INDEX idx_conversations_company_id ON conversations(company_id);
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_agents_company_id ON agents(company_id);
CREATE INDEX idx_documents_company_id ON documents(company_id);
```

### Caching Strategy
- Redis-backed caching for frequent lookups
- Query result caching for expensive requests
- Session caching for rapid authentication
- Embedding caching for semantic retrieval

### Background Processing
- Document parsing and OCR
- Database schema analysis
- Vector embedding generation
- Analytics computation
- Email notifications

## Contributing

```bash
git checkout -b feature/your-feature-name

pytest tests/

# open a pull request with details
```

Follow PEP 8, add type hints, provide docstrings, and include unit or integration coverage for changes.

## Support

- Documentation: https://docs.knowrithm.org
- Discord Community: https://discord.gg/cHHWfghJrR
- Email: support@knowrithm.org
- GitHub Issues: https://github.com/Knowrithm/knowrithm-py/issues









# Troubleshooting Guide

Common issues and quick fixes for the Knowrithm SDK and platform.

---

## Installation

**Error**: `ModuleNotFoundError: No module named 'knowrithm_py'`  
**Fix**:
1. Activate the correct virtual environment (`source .venv/bin/activate` or `.venv\Scripts\activate`).
2. Run `pip install knowrithm-py`.
3. Confirm with `python -c "import knowrithm_py"`.

**Error**: SSL certificate verification failed  
**Fix**:
- Update `certifi`: `pip install --upgrade certifi`.
- Ensure system trust store is current.

---

## Authentication

**Error**: `401 Unauthorized`  
**Causes**:
- API key or secret missing/incorrect.
- Key expired or revoked.

**Fix**:
1. Recopy credentials from **Settings -> API Keys**.
2. Ensure environment variables are loaded.
3. Call `client.auth.validate_credentials()` to confirm.

**Error**: `403 Forbidden`  
**Cause**: API key lacks required scopes.  
**Fix**: Regenerate the key with appropriate permissions (`read`, `write`, `admin`) or use a JWT with the correct role.

---

## Agents and Conversations

**Issue**: Agent replies with "I don't know."  
**Checklist**:
- Verify documents are processed: `client.documents.list_documents(agent_id=...)` and confirm `status` is `processed`.
- Run `client.analytics.search_documents(...)` to ensure relevant content is indexed.
- Update the agent description or prompts to provide clearer guidance.

**Issue**: Slow responses  
**Suggestions**:
- Review model choice in LLM settings (lighter models respond faster).
- Trim conversation context where possible.
- Check network latency between your environment and Knowrithm.

---

## Document Processing

**Issue**: Document stuck in `processing`  
**Steps**:
1. Re-upload the file after saving a clean copy.
2. Ensure the file is not password protected.
3. For scanned PDFs, confirm readable resolution (>= 300 DPI).

**Issue**: `failed` status  
**Action**:
- Inspect the `error` field in `client.documents.list_documents`.
- Correct the file format or encoding and retry.

---

## Database Connections

**Issue**: Connection test fails  
**Fix**:
- Confirm credentials and network access.
- Validate the connection string format (`postgresql://user:pass@host:port/db`).
- Use read-only credentials with sufficient privileges.

**Issue**: Text-to-SQL returns no results  
**Fix**:
- Ensure analysis completed: `client.databases.get_semantic_snapshot(connection_id)`.
- Re-run `client.databases.analyze_connection(connection_id)` after schema changes.

---

## Debugging Tips

1. Enable logging: `KnowrithmClient(..., enable_logging=True)`.
2. Capture exception details and `error.response_data`.
3. Verify platform status (internal status page or support).
4. Test components individually (auth, agent creation, document upload, conversations).
5. Use request IDs from error responses when contacting support.

---

## Need Help?

- Review the [FAQ](faq.md) and [Support](support.md) pages.
- Provide agent IDs, conversation IDs, or document IDs when submitting a ticket.







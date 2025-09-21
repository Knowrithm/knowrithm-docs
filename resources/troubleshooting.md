# Troubleshooting Guide 🔧

Encountering an issue? This guide provides solutions to common problems you might face while using the Knowrithm platform and SDK.

---

## Installation Issues

#### Error: `ModuleNotFoundError: No module named 'knowrithm_py'`

-   **Cause**: The SDK is not installed in the Python environment you are currently using.
-   **Solution**:
    1.  Make sure your virtual environment is activated (`source venv/bin/activate`).
    2.  Run `pip install knowrithm-py` again.
    3.  Verify the installation with `pip show knowrithm-py`.

#### Error: SSL Certificate Verification Failed

-   **Cause**: Your system's root SSL certificates are outdated.
-   **Solution**:
    1.  Update your system's certificate store.
    2.  In Python, you can update the `certifi` package: `pip install --upgrade certifi`.

---

## Authentication Errors

#### Error: `401 Unauthorized` or `AuthenticationError: Invalid API key`

-   **Cause**: Your API key or secret is incorrect, expired, or missing.
-   **Solution**:
    1.  Double-check that you have copied the `api_key` and `api_secret` correctly.
    2.  Ensure there are no extra spaces or characters.
    3.  Verify that the key has not expired or been revoked in your dashboard.
    4.  Make sure you are loading your environment variables correctly if using a `.env` file.

#### Error: `403 Forbidden` or `AuthorizationError: Insufficient permissions`

-   **Cause**: The API key you are using does not have the required permissions for the action you are trying to perform.
-   **Solution**:
    1.  Go to **Settings → API Keys** in your dashboard.
    2.  Check the permissions for the key you are using.
    3.  Create a new key with the appropriate permissions if necessary (e.g., "write" access to create an agent).

---

## Agent & Conversation Issues

#### Issue: Agent responses are generic or "I don't know."

-   **Cause**: The agent has not been properly trained or the information is not in its knowledge base.
-   **Solution**:
    1.  **Check Document Status**: Ensure the documents you uploaded have a `completed` processing status. Use the `get_processing_status()` method to check.
    2.  **Improve Data Quality**: Make sure the information is clearly stated in your documents. An agent can't answer what it hasn't learned.
    3.  **Refine Personality/Prompt**: Add more specific instructions to the agent's `personality` or `system_prompt` to guide its responses.
    4.  **Check Search**: Use the `document_service.search()` method to see if your query returns relevant chunks from your documents. If not, the source data may need improvement.

#### Issue: Agent responses are too slow.

-   **Cause**: Can be due to model complexity, long context, or network latency.
-   **Solution**:
    1.  **Check Model**: Consider using a faster model (e.g., `gemini-1.5-flash`) for use cases that require very low latency.
    2.  **Optimize Prompts**: Keep conversation history concise where possible.
    3.  **Check Network**: Ensure your server has a stable, low-latency connection to the Knowrithm API.

---

## Document Processing Issues

#### Issue: Document processing status is `failed`.

-   **Cause**: The document may be corrupted, password-protected, or in an unsupported format.
-   **Solution**:
    1.  Check the error message provided in the `get_processing_status()` response for details.
    2.  Ensure the file is not encrypted or password-protected.
    3.  Try re-saving the document (e.g., "Save As" a new PDF) to fix potential corruption issues.
    4.  If it's a scanned PDF, ensure the image quality is clear (at least 300 DPI is recommended for best OCR results).

---

## Debugging Tips

1.  **Enable SDK Logging**: When initializing the client, set `enable_logging=True` to see detailed request and response logs.
2.  **Check the API Status Page**: Visit status.knowrithm.org (hypothetical URL) to see if there are any ongoing platform-wide issues.
3.  **Isolate the Problem**: Use a simple script (like the one in the Quick Start guide) to test each component individually (authentication, agent creation, conversation).
4.  **Use `try...except` blocks**: Wrap your API calls in error handling blocks to catch and log specific exceptions from the SDK.

---

### Still Stuck?

If you've gone through this guide and are still having trouble, please reach out for Support.
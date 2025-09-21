# Third-Party Integrations 🤝

Connect Knowrithm to the tools you already use. This guide covers how to integrate with third-party applications using webhooks and our API.

---

## 🔮 Native Integrations (Coming Soon)

We are actively working on building seamless, one-click integrations for popular platforms. Our roadmap includes:

-   **Slack**: Get notifications and interact with your agents directly from Slack.
-   **Zapier**: Connect Knowrithm to thousands of apps with no-code automation workflows.
-   **Salesforce & HubSpot**: Automatically sync leads, contacts, and conversation logs with your CRM.
-   **Zendesk & Intercom**: Create tickets and hand off conversations from AI agents to your human support team.
-   **Twilio**: Enable conversations over SMS and WhatsApp.

Have a specific integration you'd like to see? [Let us know!](mailto:support@knowrithm.org)

---

## 🛠️ Building Custom Integrations Today

You don't have to wait for native integrations! You can connect Knowrithm to almost any service today using our powerful webhooks and APIs.

### Pattern 1: No-Code Automation with Zapier or Make

This is the easiest way to connect Knowrithm to other apps without writing any code. The process uses a generic "Webhook" trigger available in platforms like [Zapier](https://zapier.com/) or [Make (formerly Integromat)](https://www.make.com/).

**Example: Sending New Leads to a Google Sheet**

1.  **In Zapier/Make**:
    -   Create a new workflow (a "Zap" in Zapier).
    -   For the trigger, search for and select **"Webhooks"**.
    -   Choose the **"Catch Hook"** or **"Custom Webhook"** trigger type.
    -   The platform will generate a unique webhook URL. Copy it.

2.  **In Knowrithm**:
    -   Go to **Settings → Integrations → Webhooks** in your dashboard.
    -   Add a new endpoint and paste the URL you copied from Zapier/Make.
    -   Subscribe to the `lead.created` event.
    -   Save the endpoint.

3.  **Trigger the Webhook**:
    -   Go back to your Zapier/Make workflow. It will now be "listening" for a request.
    -   In Knowrithm, perform an action that creates a lead (e.g., through a test conversation or by creating one manually via the API).
    -   Knowrithm will send the `lead.created` event to your webhook URL.

4.  **In Zapier/Make**:
    -   The platform will show that it has received the data. You can now see the lead's information (name, email, etc.).
    -   Add a new action step. Search for **"Google Sheets"**.
    -   Choose the **"Create Spreadsheet Row"** action.
    -   Connect your Google account and select the spreadsheet and worksheet you want to use.
    -   Map the data from the webhook trigger to the columns in your spreadsheet (e.g., map `data.first_name` to the "First Name" column).

5.  **Activate Your Workflow**: Turn on your Zap/Scenario.

**Congratulations!** Now, every time a new lead is created in Knowrithm, it will be automatically added to your Google Sheet in real-time. You can use this same pattern to connect to countless other apps.

### Pattern 2: Custom Integration Service with the SDK

For more complex logic or integrations with internal systems, you can build a small service using our Python SDK. This service can either listen for webhooks (as shown in the Webhooks Guide) or periodically pull data from the Knowrithm API.

**Example: Daily Sync of Conversation Ratings to a Database**

This script runs daily, fetches all conversations from the previous day, and saves their ratings to a local database.

```python
import os
import sqlite3
from datetime import datetime, timedelta
from dotenv import load_dotenv
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.services.conversation import ConversationService

def setup_local_db():
    """Sets up a local SQLite DB for storing ratings."""
    conn = sqlite3.connect("analytics.db")
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversation_ratings (
        id TEXT PRIMARY KEY,
        ended_at TEXT,
        rating INTEGER
    );
    """)
    conn.commit()
    return conn

def sync_daily_ratings():
    """Fetches yesterday's conversations and saves their ratings."""
    load_dotenv()
    client = KnowrithmClient(
        api_key=os.getenv("KNOWRITHM_API_KEY"),
        api_secret=os.getenv("KNOWRITHM_API_SECRET"),
    )
    conversation_service = ConversationService(client)
    db_conn = setup_local_db()
    
    # Define date range for yesterday
    yesterday = datetime.utcnow() - timedelta(days=1)
    start_date = yesterday.replace(hour=0, minute=0, second=0)
    end_date = yesterday.replace(hour=23, minute=59, second=59)

    print(f"Fetching conversations from {start_date} to {end_date}...")

    # Fetch conversations from the last day
    conversations = conversation_service.list(params={
        "status": "ended",
        "ended_after": start_date.isoformat() + "Z",
        "ended_before": end_date.isoformat() + "Z"
    })

    cursor = db_conn.cursor()
    for conv in conversations:
        if conv.get('rating') is not None:
            print(f"Syncing conversation {conv['id']} with rating {conv['rating']}")
            cursor.execute(
                "INSERT OR REPLACE INTO conversation_ratings (id, ended_at, rating) VALUES (?, ?, ?)",
                (conv['id'], conv['ended_at'], conv['rating'])
            )
    
    db_conn.commit()
    db_conn.close()
    print(f"✅ Synced {len(conversations)} conversations.")

if __name__ == "__main__":
    sync_daily_ratings()
```
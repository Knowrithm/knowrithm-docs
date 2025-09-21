# Tutorial: Advanced Analytics & Reporting 📊

This tutorial goes beyond the basics to show you how to leverage the `AnalyticsService` for deep performance insights, agent A/B testing, and custom reporting.

---

## 🎯 What You'll Learn

- How to create a custom, multi-agent performance dashboard.
- How to compare two agents head-to-head (A/B testing).
- How to analyze conversation transcripts to find common topics and issues.
- How to export raw data for use in external tools like Tableau or Power BI.

---

## 📋 Prerequisites

- A Knowrithm account with several active agents and a history of conversations.
- The Knowrithm Python SDK installed and configured.
- Familiarity with the `AnalyticsService` from the Python SDK guide.

---

## 🛠️ Step 1: Setting Up for the Tutorial

Create a new Python script named `advanced_analytics_tutorial.py` and set up your client. For this tutorial, we'll assume you have at least two agents to compare.

```python
# advanced_analytics_tutorial.py
import os
import csv
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.services.agent import AgentService
from knowrithm_py.services.analytics import AnalyticsService

# Setup client
load_dotenv()
client = KnowrithmClient(
    api_key=os.getenv("KNOWRITHM_API_KEY"),
    api_secret=os.getenv("KNOWRITHM_API_SECRET"),
)

# --- Find two agents to compare ---
agent_service = AgentService(client)
all_agents = agent_service.list()

if len(all_agents) < 2:
    print("❌ This tutorial requires at least two agents to compare. Please create more agents.")
    exit()

agent_a_id = all_agents[0]['id']
agent_b_id = all_agents[1]['id']
print(f"Comparing Agent A ({all_agents[0]['name']}) and Agent B ({all_agents[1]['name']})")
```

---

## 📈 Step 2: Building a Custom Performance Dashboard

Let's create a function that generates a performance summary for a list of agents, allowing you to see a high-level comparison.

```python
analytics_service = AnalyticsService(client)

def create_performance_dashboard(agent_ids: list):
    """Fetches key metrics for a list of agents and prints a dashboard."""
    
    print("\n--- 📊 Custom Performance Dashboard ---")
    print(f"{'Agent Name':<25} | {'Total Convos':<15} | {'Avg. Rating':<15} | {'Avg. Response (s)':<20}")
    print("-" * 80)

    for agent_id in agent_ids:
        try:
            # Fetch agent details to get the name
            agent = agent_service.get(agent_id)
            agent_name = agent.get('name', agent_id)

            # Fetch metrics for the last 30 days
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            
            metrics = analytics_service.get_agent_metrics(
                agent_id=agent_id,
                start_date=start_date.isoformat() + "Z",
                end_date=end_date.isoformat() + "Z"
            )

            total_convos = metrics['conversation_metrics']['total_conversations']
            avg_rating = metrics['quality_metrics']['avg_satisfaction_rating']
            avg_response = metrics['performance_metrics']['avg_response_time_seconds']

            print(f"{agent_name:<25} | {total_convos:<15} | {avg_rating:<15.2f} | {avg_response:<20.2f}")

        except Exception as e:
            print(f"Could not fetch metrics for agent {agent_id}: {e}")
    print("-" * 80)

# Run the dashboard for our two agents
create_performance_dashboard([agent_a_id, agent_b_id])
```

---

## ⚔️ Step 3: A/B Testing Agents

The `get_agent_performance_comparison` endpoint is perfect for A/B testing. Let's compare our two agents directly against the company average.

```python
def compare_agent_to_average(agent_id: str, agent_name: str):
    """Compares a single agent's performance to the company average."""
    print(f"\n--- A/B Test Results for: {agent_name} ---")
    try:
        comparison = analytics_service.get_agent_performance_comparison(
            agent_id=agent_id,
            start_date=(datetime.utcnow() - timedelta(days=30)).isoformat() + "Z",
            end_date=datetime.utcnow().isoformat() + "Z"
        )
        
        comp_data = comparison['performance_comparison']
        satisfaction = comp_data['satisfaction_rating']['performance_vs_average_percent']
        response_time = comp_data['response_time']['performance_vs_average_percent']

        print(f"Satisfaction vs. Average: {satisfaction:+.2f}%")
        print(f"Response Time vs. Average: {response_time:+.2f}% (Note: Negative is better)")

    except Exception as e:
        print(f"Could not fetch comparison data: {e}")

compare_agent_to_average(agent_a_id, all_agents[0]['name'])
compare_agent_to_average(agent_b_id, all_agents[1]['name'])
```

This helps you quickly identify which agent personality, model, or training data is performing better.

---

## 🔍 Step 4: Exporting Data for Deep Analysis

Sometimes you need to go deeper than the pre-built metrics. Exporting raw conversation data allows you to perform custom analysis, such as topic modeling or sentiment analysis, in external tools.

Let's export all conversations for "Agent A" from the last month to a CSV file.

```python
def export_conversations_to_csv(agent_id: str, filename: str):
    """Exports all conversations for an agent to a CSV file."""
    print(f"\nExporting conversations for agent {agent_id} to {filename}...")
    try:
        export_request = {
            "type": "conversations",
            "format": "csv",
            "start_date": (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z",
            "end_date": datetime.utcnow().isoformat() + "Z",
            "filters": {"agent_id": agent_id}
        }
        
        response = analytics_service.export_analytics_data(export_request)

        if 'data' in response and response['data']:
            # The 'data' key contains the full CSV content as a string
            with open(filename, "w", newline="", encoding="utf-8") as f:
                f.write(response['data'])
            print(f"✅ Successfully exported {response.get('count', 0)} conversations.")
        else:
            print("⚠️ No data returned for the specified period.")

    except Exception as e:
        print(f"❌ Export failed: {e}")

# Run the export
export_conversations_to_csv(agent_a_id, f"agent_{agent_a_id}_conversations.csv")
```

You can now open this CSV file in Excel, Google Sheets, or a Python script using the `pandas` library to perform in-depth analysis.

### Example Analysis with Pandas

```python
# (Optional) Requires pandas: pip install pandas
import pandas as pd

def analyze_exported_csv(filename: str):
    """Performs a simple analysis on the exported CSV."""
    try:
        df = pd.read_csv(filename)
        
        # Calculate average rating from the exported data
        avg_rating = df['rating'].mean()
        print(f"\n--- Analysis of {filename} ---")
        print(f"Calculated Average Rating: {avg_rating:.2f}")

        # Find the longest conversation
        longest_convo = df.loc[df['message_count'].idxmax()]
        print(f"Longest Conversation ID: {longest_convo['id']} ({longest_convo['message_count']} messages)")

    except FileNotFoundError:
        print(f"File not found: {filename}")
    except Exception as e:
        print(f"Could not analyze CSV: {e}")

# analyze_exported_csv(f"agent_{agent_a_id}_conversations.csv")
```

---

## 🎉 Congratulations!

You've now mastered the advanced capabilities of the Knowrithm Analytics Service. You can:
- Build custom reports to monitor your entire fleet of agents.
- Objectively compare agents to find the most effective configurations.
- Export raw data for unlimited flexibility in your analysis.

Using these techniques, you can move from simply having AI agents to having a fully optimized, data-driven conversational AI strategy.

## Next Steps

-   **Automate Reporting**: Schedule your dashboard script to run daily or weekly and send the results to your team via email or Slack.
-   **Visualize Your Data**: Use the exported CSV or JSON data to create powerful visualizations in tools like Tableau, Power BI, or Matplotlib.
-   **Analyze Conversation Content**: Use Natural Language Processing (NLP) libraries like NLTK or spaCy on your exported conversation data to identify common user pain points, emerging topics, or sentiment trends.
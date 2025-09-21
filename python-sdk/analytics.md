# Analytics & Monitoring 📊

This guide provides a comprehensive overview of the `AnalyticsService`, which allows you to monitor agent performance, track user engagement, and gain actionable insights to improve your AI solutions.

## 🎯 Why Use Analytics?

The Analytics Service is crucial for understanding and optimizing your AI agents. It helps you answer key questions:
- **Performance**: Are my agents responding quickly and accurately?
- **Engagement**: Are users finding the agents helpful?
- **Quality**: What is the user satisfaction level?
- **Business Impact**: Are agents helping to convert leads and achieve business goals?

---

## 🚀 Getting Started with Analytics

All analytics functions are accessed through the `AnalyticsService`.

```python
from knowrithm_py.services.analytics import AnalyticsService

analytics_service = AnalyticsService(client)
```

### The Main Dashboard

The `get_dashboard()` method provides a high-level, real-time overview of your entire platform.

```python
dashboard_data = analytics_service.get_dashboard()

print("--- 📈 Platform Dashboard ---")
print(f"Total Agents: {dashboard_data['agents']['total']}")
print(f"Active Conversations: {dashboard_data['conversations']['active']}")
print(f"Total Messages Today: {dashboard_data['messages']['today']}")
print(f"New Leads This Week: {dashboard_data['leads']['this_week']}")
print("--------------------------")
```

---

## 🤖 Agent-Specific Metrics

Dive deep into the performance of a single agent.

### Getting Agent Metrics

Use `get_agent_metrics()` to retrieve detailed statistics for a specific agent over a given time period.

```python
agent_id = "your-agent-id"

agent_metrics = analytics_service.get_agent_metrics(
    agent_id=agent_id,
    start_date="2024-01-01T00:00:00Z",
    end_date="2024-01-31T23:59:59Z"
)

# Performance Metrics
perf_metrics = agent_metrics['performance_metrics']
print(f"\n--- Performance for Agent {agent_id} ---")
print(f"Avg. Response Time: {perf_metrics['avg_response_time_seconds']:.2f}s")
print(f"First Response Time: {perf_metrics['avg_first_response_time_seconds']:.2f}s")

# Quality Metrics
quality_metrics = agent_metrics['quality_metrics']
print("\n--- Quality ---")
print(f"Avg. Satisfaction Rating: {quality_metrics['avg_satisfaction_rating']:.2f}/5.0")
print(f"Positive Feedback Rate: {quality_metrics['positive_feedback_percent']:.1f}%")

# Conversation Metrics
conv_metrics = agent_metrics['conversation_metrics']
print("\n--- Engagement ---")
print(f"Total Conversations: {conv_metrics['total_conversations']}")
print(f"Avg. Messages per Conversation: {conv_metrics['avg_messages_per_conversation']:.1f}")
```

### Comparing Agent Performance

Use `get_agent_performance_comparison()` to see how one agent stacks up against the company average.

```python
comparison_data = analytics_service.get_agent_performance_comparison(
    agent_id=agent_id,
    start_date="2024-01-01T00:00:00Z",
    end_date="2024-01-31T23:59:59Z"
)

comparison = comparison_data['performance_comparison']

print(f"\n--- Agent vs. Company Average ---")
satisfaction_diff = comparison['satisfaction_rating']['performance_vs_average_percent']
print(f"Satisfaction: {satisfaction_diff:+.1f}% vs. average")

response_time_diff = comparison['response_time']['performance_vs_average_percent']
print(f"Response Time: {response_time_diff:+.1f}% vs. average (lower is better)")
```

---

## 💬 Conversation & Lead Analytics

### Analyzing a Single Conversation

Get a detailed breakdown of a specific conversation to debug issues or understand user journeys.

```python
conversation_id = "your-conversation-id"

conv_analytics = analytics_service.get_conversation_analytics(conversation_id)

print(f"\n--- Analytics for Conversation {conversation_id} ---")
print(f"Duration: {conv_analytics['conversation_flow']['duration_minutes']:.2f} minutes")
print(f"Message Count (User): {conv_analytics['message_statistics']['user_message_count']}")
print(f"Message Count (Agent): {conv_analytics['message_statistics']['agent_message_count']}")
print(f"Topics Detected: {', '.join(conv_analytics['topic_analysis']['detected_topics'])}")
```

### Lead Analytics

Track your lead generation and conversion funnel performance.

```python
lead_analytics = analytics_service.get_lead_analytics(
    start_date="2024-01-01T00:00:00Z",
    end_date="2024-01-31T23:59:59Z"
)

print("\n--- Lead Generation Funnel ---")
print(f"Total Leads Generated: {lead_analytics['lead_summary']['total_leads']}")
print(f"Conversion Rate: {lead_analytics['conversion_funnel']['overall_conversion_rate_percent']:.2f}%")

if lead_analytics['top_performing_sources']:
    top_source = lead_analytics['top_performing_sources'][0]
    print(f"Top Lead Source: {top_source['source']} ({top_source['count']} leads)")
```

---

## 📈 Usage Metrics & Data Export

### Platform Usage

Monitor your overall API usage and platform health.

```python
usage_metrics = analytics_service.get_usage_metrics(
    start_date="2024-01-01T00:00:00Z",
    end_date="2024-01-31T23:59:59Z"
)

api_usage = usage_metrics['api_usage']
print("\n--- API Usage ---")
print(f"Total API Calls: {api_usage['total_api_calls']}")
print(f"Avg. API Response Time: {api_usage['avg_response_time_ms']:.0f}ms")
print(f"API Error Rate: {api_usage['error_rate_percent']:.2f}%")
```

### Exporting Data

Export raw analytics data in JSON or CSV format for use in external tools like Tableau, Power BI, or custom scripts.

```python
# Export conversation data as a JSON file
conversation_export = analytics_service.export_analytics_data({
    "type": "conversations",
    "format": "json",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-01-31T23:59:59Z",
    "filters": {
        "agent_id": agent_id
    }
})

# The response contains the data directly or a URL to download it
if 'download_url' in conversation_export:
    print(f"Download your JSON export from: {conversation_export['download_url']}")
elif 'data' in conversation_export:
    # For smaller exports, data might be included directly
    print(f"Exported {len(conversation_export['data'])} conversations.")


# Export lead data as a CSV file
lead_export = analytics_service.export_analytics_data({
    "type": "leads",
    "format": "csv",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-01-31T23:59:59Z"
})

if 'data' in lead_export:
    # Save the CSV data to a file
    with open("leads_export.csv", "w") as f:
        f.write(lead_export['data'])
    print("✅ Lead data exported to leads_export.csv")
```

---

## ✨ Best Practices

- **Monitor Regularly**: Set up a scheduled script to fetch key metrics daily or weekly to catch performance degradation early.
- **Focus on Satisfaction**: User satisfaction rating is one of the most important metrics. If it drops, review conversation logs to understand why.
- **Use Date Ranges**: Always use `start_date` and `end_date` to analyze performance over specific periods (e.g., week-over-week, month-over-month).
- **Correlate Metrics**: Look for connections between metrics. For example, does a higher response time correlate with lower user satisfaction?
- **Export for Deep Dives**: Use the export functionality to pull data into business intelligence tools for more complex analysis and visualization.

---

## 💡 Full Example: Weekly Performance Report

This script generates a weekly performance report for a specific agent.

```python
from datetime import datetime, timedelta

def generate_weekly_report(client, agent_id):
    """Generates and prints a weekly performance report for an agent."""
    analytics_service = AnalyticsService(client)
    
    # Define the date range for the last 7 days
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    print(f"--- Weekly Performance Report for Agent {agent_id} ---")
    print(f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    
    try:
        # Fetch metrics
        metrics = analytics_service.get_agent_metrics(
            agent_id=agent_id,
            start_date=start_date.isoformat() + "Z",
            end_date=end_date.isoformat() + "Z"
        )
        
        # --- Key Performance Indicators (KPIs) ---
        print("\n--- KPIs ---")
        conv_metrics = metrics['conversation_metrics']
        quality_metrics = metrics['quality_metrics']
        perf_metrics = metrics['performance_metrics']
        
        print(f"Total Conversations: {conv_metrics['total_conversations']}")
        print(f"Avg. Satisfaction: {quality_metrics['avg_satisfaction_rating']:.2f}/5.0")
        print(f"Avg. Response Time: {perf_metrics['avg_response_time_seconds']:.2f}s")
        
        # --- Engagement Trends ---
        print("\n--- Engagement ---")
        print(f"Avg. Messages per Conversation: {conv_metrics['avg_messages_per_conversation']:.1f}")
        print(f"Total Messages: {conv_metrics['total_messages']}")
        
        # --- Quality Insights ---
        print("\n--- Quality ---")
        print(f"Conversations with Ratings: {quality_metrics['rated_conversations_count']}")
        print(f"Positive Feedback Rate: {quality_metrics['positive_feedback_percent']:.1f}%")
        
        print("\n--- Report Complete ---")
        
    except Exception as e:
        print(f"\n❌ Could not generate report: {e}")

# To run this example:
# 1. Make sure 'client' is an initialized KnowrithmClient.
# 2. Replace 'your-agent-id' with a real agent ID.
# generate_weekly_report(client, "your-agent-id")
```

---

## Next Steps

- **Explore Tutorials**: See how to apply these analytics in real-world scenarios.
  [Advanced Analytics Tutorial](../tutorials/advanced-analytics.md)
- **Manage Leads**: Learn how to track and convert leads.
  [Lead Management Guide](leads.md)
# 🌐 Website Chat Widget

Deploy your AI agent to any website in minutes with a simple, customizable chat widget. This no-code solution is the fastest way to start engaging with your users.

---

## 🚀 Quick Start

To add the chat widget to your website, copy the following HTML snippet and paste it into the `<head>` section of your HTML file.

```html
<!-- Add to your website's <head> section -->
<script 
    src="https://app.knowrithm.org/api/widget.js"
    data-agent-id="your-agent-id"
    data-company-id="your-company-id"
    data-api-url="https://app.knowrithm.org"
    data-color="#007bff"
    data-position="bottom-right"
    data-welcome="Hi! How can I help you today?"
    data-title="Support Chat"
    async>
</script>
```

**That's it!** The chat widget will now appear on your website, ready to connect users with your specified agent.

---

## 🔧 Customization Options

You can customize the widget's appearance and behavior using `data-*` attributes in the `<script>` tag.

| Attribute | Description | Default Value | Example |
|---|---|---|---|
| `data-agent-id` | **(Required)** The ID of the agent to connect to. | `null` | `"agent_123abc"` |
| `data-company-id` | **(Required)** The ID of your company account. | `null` | `"company_456def"` |
| `data-api-url` | The base URL of the Knowrithm API. | `"https://app.knowrithm.org"` | `"https://app.knowrithm.org"` |
| `data-title` | The title displayed in the widget's header. | `"Chat with us"` | `"Acme Support"` |
| `data-welcome` | The initial greeting message from the agent. | `"Hi! How can I help?"` | `"Welcome! Ask me anything."` |
| `data-color` | The primary color for the widget header and icons (hex code). | `"#3f51b5"` | `"#ff5722"` |
| `data-position` | The position of the chat bubble on the screen. | `"bottom-right"` | `"bottom-left"` |
| `data-open` | Set to `"true"` to have the widget open by default. | `"false"` | `"true"` |
| `data-z-index` | The CSS `z-index` for the widget. | `"999999"` | `"10000"` |

### Example with Customizations

```html
<script 
    src="https://app.knowrithm.org/api/widget.js"
    data-agent-id="agent_sales_456"
    data-company-id="company_acme_corp"
    data-title="Sales Assistant"
    data-welcome="Hello! Interested in our products? I can help you find the perfect fit."
    data-color="#e91e63"
    data-position="bottom-right"
    async>
</script>
```

---

## ✨ Advanced Configuration

You can interact with the widget programmatically using JavaScript events and functions.

### JavaScript API

The widget exposes a global `KnowrithmWidget` object with methods you can call.

```javascript
// Open the chat widget
window.KnowrithmWidget.open();

// Close the chat widget
window.KnowrithmWidget.close();

// Toggle the widget's visibility
window.KnowrithmWidget.toggle();

// Update metadata for the current conversation
window.KnowrithmWidget.updateMetadata({
  userId: "user-123",
  plan: "premium",
  sourcePage: window.location.pathname
});
```

### Listening to Events

The widget dispatches custom events on the `window` object, allowing you to hook into its lifecycle.

```javascript
// Listen for when the widget is fully loaded and ready
window.addEventListener('knowrithm:ready', () => {
  console.log('Knowrithm widget is ready!');
});

// Listen for when a new conversation starts
window.addEventListener('knowrithm:conversation.started', (event) => {
  const { conversationId } = event.detail;
  console.log(`Conversation started: ${conversationId}`);
  // Example: Send this ID to your analytics service
  // myAnalytics.track('chat_started', { conversationId });
});

// Listen for when a new message is received from the agent
window.addEventListener('knowrithm:message.received', (event) => {
  const { message } = event.detail;
  console.log(`Agent said: ${message.content}`);
});

// Listen for when the widget is opened
window.addEventListener('knowrithm:widget.opened', () => {
  console.log('Widget was opened.');
});
```

---

## 🔒 Security Considerations

### Domain Whitelisting

For added security, you can configure a list of allowed domains for your `company-id` in your Knowrithm dashboard under **Settings → Security**. The widget will only load on websites from the whitelisted domains.

### Content Security Policy (CSP)

If your website uses a Content Security Policy, you'll need to add the Knowrithm domain to your directives:

```http
Content-Security-Policy:
  script-src 'self' https://app.knowrithm.org;
  connect-src 'self' https://app.knowrithm.org wss://app.knowrithm.org;
  style-src 'self' 'unsafe-inline' https://app.knowrithm.org;
  frame-src https://app.knowrithm.org;
```

---

## 🔧 Troubleshooting

### Widget Not Appearing

1.  **Check `data-agent-id` and `data-company-id`**: Ensure these IDs are correct and copied directly from your dashboard.
2.  **Check Browser Console**: Open your browser's developer tools (F12) and look for any errors in the Console tab.
3.  **Check Domain Whitelist**: If you have domain whitelisting enabled, make sure the domain you're testing on is included.
4.  **Ad Blockers**: Some aggressive ad blockers may interfere with the widget script. Try disabling them to test.

### Widget Not Connecting or "Agent Offline"

1.  **Check API Status**: Visit the Knowrithm Status Page to ensure all systems are operational.
2.  **Check CSP**: If you have a Content Security Policy, ensure the `connect-src` and `wss:` directives are correctly configured.
3.  **Check Agent Status**: Make sure the agent specified in `data-agent-id` is active and not disabled in your dashboard.

---

## Next Steps

- **Explore Agent Management**: Fine-tune your agent's personality and knowledge.
  Agent Management Guide
- **Set Up Webhooks**: Receive real-time notifications from your agent's conversations.
  Webhooks API Reference
- **Analyze Performance**: Track how users are interacting with your widget.
  Analytics Guide
# Website Widget

Embed a Knowrithm agent on any webpage with a single script tag. The widget handles authentication, conversation lifecycle, and streaming responses to deliver an out-of-the-box chat experience.

---

## Quick Start

Add the script to your HTML (preferably before the closing `</body>` tag).

```html
<script
  src="https://app.knowrithm.org/widget.js"
  data-agent-id="your-agent-id"
  async>
</script>
```

The widget renders a floating launcher bubble. Clicking it opens the chat panel connected to the specified agent.

---

## Configuration Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-agent-id` | Yes | Agent UUID returned by `/v1/agent` |
| `data-company-id` | Yes | Company UUID (visible in dashboard or via `/v1/company`) |
| `data-title` | No | Header title inside the widget (`"Chat with us"` default) |
| `data-welcome` | No | Initial greeting shown to users |
| `data-color` | No | Hex color for header and launcher (e.g., `#3f51b5`) |
| `data-position` | No | `bottom-right` or `bottom-left` |
| `data-open` | No | `"true"` to auto-open on load |
| `data-z-index` | No | Override stacking order (default `999999`) |

Example:

```html
<script
  src="https://app.knowrithm.org/widget.js"
  data-agent-id="agent-support"
  data-title="Support Center"
  data-welcome="Hi there! Ask me anything about our plans."
  data-color="#0052cc"
  data-position="bottom-right"
  async>
</script>
```

---

## JavaScript API

When the script loads it exposes `window.KnowrithmWidget`.

```javascript
window.addEventListener("knowrithm:ready", () => {
  console.log("Widget ready");
});

window.KnowrithmWidget.open();
window.KnowrithmWidget.close();
window.KnowrithmWidget.toggle();

// Attach metadata to the active conversation
window.KnowrithmWidget.updateMetadata({
  plan: "enterprise",
  campaign: "summer-2025"
});
```

Events dispatched on `window`:
- `knowrithm:ready` - widget fully loaded
- `knowrithm:conversation.started` - detail contains `{ conversationId }`
- `knowrithm:message.received` - detail contains `{ message }`
- `knowrithm:widget.opened` / `knowrithm:widget.closed`

---

## Security

- **Allowed domains**: Configure approved origins in the dashboard (Settings > Security) to limit where the widget can load.
- **Content Security Policy**: include Knowrithm origins in your CSP.
  ```text
  script-src 'self' https://app.knowrithm.org;
  connect-src 'self' https://app.knowrithm.org wss://app.knowrithm.org;
  style-src 'self' 'unsafe-inline' https://app.knowrithm.org;
  frame-src https://app.knowrithm.org;
  ```
- **Privacy**: Session data is stored server-side. Use metadata to pass consent flags when required.

---

## Troubleshooting

1. **Widget missing** - verify `data-agent-id` and `data-company-id`, and ensure domain whitelisting permits the current origin.
2. **Connection issues** - check the Knowrithm status page and confirm CSP directives.
3. **Ad blockers** - some extensions block third-party scripts; test with blockers disabled.

---

## Related Resources

- [Agent API Reference](../api-reference/agents.md)
- [Conversation API Reference](../api-reference/conversations.md)
- [Webhooks Guide](webhooks.md)
- [Analytics Overview](../api-reference/analytics.md)







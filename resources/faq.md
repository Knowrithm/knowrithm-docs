# Frequently Asked Questions (FAQ)

Find answers to common questions about Knowrithm, our services, and the platform.

---

## General Questions

#### What is Knowrithm?
Knowrithm is a comprehensive platform for building, training, and deploying intelligent AI agents. It allows businesses to create custom chatbots that can be trained on their own data (documents, databases) to handle customer support, lead generation, and more.

#### Who is Knowrithm for?
Knowrithm is designed for developers, businesses, and data scientists who want to integrate powerful, custom AI agents into their applications and workflows with minimal hassle.

#### Can I try Knowrithm for free?
Yes, we offer a free tier that allows you to explore the core features of the platform, including agent creation, document upload, and conversations. Check our pricing page for more details.

---

## Technical Questions

#### What AI models do you use?
Our platform is model-agnostic, but we primarily leverage state-of-the-art models like Google's Gemini series for their advanced reasoning and multi-modal capabilities. You can specify which model an agent should use during creation.

#### What document formats are supported for training?
We support a wide range of formats, including PDF (text-based and scanned with OCR), DOCX, TXT, CSV, JSON, and XML.

#### Can I connect my own database?
Yes! You can connect PostgreSQL, MySQL, SQLite, and MongoDB databases. The agent can then query these databases to provide real-time answers.

#### What are the API rate limits?
Rate limits vary by plan. You can find the specific limits for your plan in the [API Reference](../api-reference/#rate-limiting). All responses include `X-RateLimit-*` headers to help you track your usage.

#### Can I self-host the Knowrithm platform?
Yes, we provide Docker and Kubernetes deployment options for enterprise customers who require a self-hosted or private cloud solution. Please see our Deployment Guide for more information.

---

## SDK & Integrations

#### What programming languages do you support?
Our primary, fully-featured SDK is for **Python**. We have plans for JavaScript/Node.js, Go, and other languages. You can also interact with our platform from any language via our REST API.

#### How do I add the chat widget to my website?
You can embed the widget by adding a single `<script>` tag to your website's HTML. You can find the code snippet and customization options in the Website Widget Guide.

#### How do webhooks work?
Webhooks send a `POST` request to a URL you specify whenever a certain event occurs (e.g., `conversation.started`, `lead.created`). You must validate the request using the provided signature and your webhook secret. See the API Reference for details.

---

## Billing & Account

#### How does pricing work?
Our pricing is typically based on a combination of factors, including the number of agents, monthly conversations, and advanced features like database integrations. Please visit our official pricing page for the most up-to-date information.

#### How can I upgrade or downgrade my plan?
You can manage your subscription directly from your account dashboard under the "Billing" section.

#### Where can I find my API keys?
Your API keys can be generated and managed in your account dashboard under **Settings -> API Keys**.

---

## Still have questions?

If your question isn't answered here, please check out our Support page for more ways to get help.










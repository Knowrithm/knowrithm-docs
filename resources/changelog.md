# Changelog

All notable changes to the Knowrithm platform and Python SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Native Zapier integration for no-code workflows.

### Changed
- Improved OCR accuracy for low-resolution scanned documents.

---

## [1.2.0] - 2024-05-20

### Added
- **Streaming Responses**: The `MessageService` now supports a `send_message_stream()` method for real-time chat applications.
- **Agent Performance Comparison**: New endpoint `get_agent_performance_comparison()` in the `AnalyticsService` to benchmark agents against company averages.
- **Database Integration**: Added support for connecting MongoDB databases.

### Changed
- The `get_dashboard()` endpoint in `AnalyticsService` now includes lead metrics (`leads.this_week`, `leads.today`).
- Upgraded the default agent model to `gemini-1.5-pro-latest`.

### Fixed
- Fixed a bug where document processing would occasionally stall for very large files.
- Corrected an issue where pagination headers were missing from some `list` endpoints.

---

## [1.1.5] - 2024-04-15

### Added
- Added `metadata` field to the `document.upload()` method to allow for custom tagging of documents.

### Fixed
- Resolved an issue with the website widget on Safari browsers.
- Improved error messaging for API key permission failures.

---

## [1.0.0] - 2024-03-01

### Added
- Initial public release of the Knowrithm platform.
- Python SDK (`knowrithm-py`) v1.0.0 released.
- Core features:
  - Agent Management
  - Conversation Management
  - Document Processing (PDF, DOCX, TXT)
  - Database Integration (PostgreSQL, MySQL)
  - Analytics Dashboard
  - Website Chat Widget
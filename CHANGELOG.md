# Changelog

All notable changes to this project will be documented in this file.

## [1.1.2] - 2026-05-12

### Added
- Master checkbox (tri-state) and enabled/total count for highlight keywords section
- Clear all button with two-click confirmation for highlight keywords section
- Contacted company scraper — fetch company names that messaged you on 104 and bulk-add to block or highlight list
- Collapsible sections in popup; scraper sections start collapsed

## [1.1.1] - 2026-05-12

### Fixed
- Consistent error handling across all storage write paths (`chrome.storage.local` reject + console.error pattern)
- Scraper errors now shown inline in status text instead of alert dialogs

## [1.1.0] - 2026-05-12

### Added
- Initial public release
- Block keywords — hide job cards matching keywords; reversible on removal
- Highlight keywords — color-coded border/background per matched keyword (6 colors: yellow, red, green, blue, orange, purple)
- Per-keyword controls: regex toggle, enable/disable, remove, drag-to-reorder
- Master checkbox (tri-state) and enabled/total count for block keywords section
- Clear all button with two-click confirmation for block keywords section
- Applied company scraper — fetch applied company names from 104 and bulk-add to block or highlight list
- Import / export all keywords as JSON
- Case-insensitive plain text matching; optional regex per keyword
- Real-time filtering — no page refresh needed

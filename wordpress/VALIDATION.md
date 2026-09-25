# WordPress conversion verification

Verified on an isolated local WordPress 7.1.2 installation with PHP 8.3.35 and the official SQLite integration. The user's Docker WordPress installation was not reachable, so its database was not modified.

- The administrator setup screen imported seven editable pages, 16 destinations, 12 country terms, three coming-soon article previews, and 22 media attachments.
- Repeating the import added no duplicate content and preserved an edited homepage paragraph.
- WordPress parsed all seven pages, seven templates, two template parts, and six patterns without invalid blocks.
- An actual editor save/reload preserved changed text, all 44 homepage blocks, and all 10 decorative SVGs.
- Nine public routes were checked at 1440px and 390px: HTTP 200, no JavaScript errors, no broken images or requests, and no horizontal overflow.
- Mobile navigation and editable field-guide topic switching worked.
- Map filtering, search, zoom, empty regions, country links, packing persistence/download/reset, and official travel-resource selectors passed browser checks.
- Destination/post metadata REST permission checks, protected-content exclusion, coordinates, coming-soon rendering, and server-rendered fallback content passed integration checks.
- Newsletter validation, affirmative consent, duplicate handling, private CSV export permissions, unsubscribe, token rotation on resubscription, and rate limiting passed real HTTP tests.
- Theme/plugin PHP files passed syntax checks. The production interactive-tools bundle built successfully.

The newsletter collects subscriptions; no email delivery provider is connected. Existing subscribers from the original Node/SQLite backend are not imported automatically. The three article previews and Budget Guides remain clearly marked as unfinished content.

Raw test reports and screenshots are under the project's ignored `artifacts/` directory. The portable test server and its credentials are local testing fixtures only and are excluded from both ZIP packages.

# Newsletter collection

The subscribe form saves contacts to a real, private SQLite mailing list on the Node server. It works in Vite development, Vite preview, and `npm start`. No email delivery provider is connected and this implementation does not send messages or confirmation emails. No API keys are needed to collect subscriptions.

Use Node.js 24 or newer (the built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html) API is required). Install dependencies with `npm install`, then run `npm run dev`. Data is created only when the API first needs it, in `data/newsletter.sqlite`. Restarting the server keeps subscribers.

## Hosting

1. Copy `.env.example` to `.env`. Set `SITE_URL` to the public HTTPS origin, such as `https://travel.example`. Keep it unset during Vite development, where the current browser origin is checked instead.
2. Point `NEWSLETTER_DATA_DIR` at a **persistent private disk** in production. The default `./data` works only when that directory survives deploys and restarts. Do not put it inside `public`, `dist`, or `src`. Keep backups of the database, including its SQLite WAL state (stop the process before a simple file-copy backup).
3. Run `npm run build` and `npm start` with `NODE_ENV=production`. Set `HOST=0.0.0.0` if required by your container; the default is `127.0.0.1`, suitable behind a local reverse proxy. `PORT` defaults to `3000`.
4. Route both the website and `/api/newsletter/*` to this same Node service through HTTPS. A static-only host cannot save subscriptions. Serverless ephemeral filesystems are not suitable for this implementation. Use one server instance with its attached disk; multiple independent instances would create separate lists.

The server serves only built files and the existing website routes, including `/subscribe` and `/unsubscribe`. The SQLite database and exported CSVs are excluded from Git and HTTP access. Vite also blocks direct private-file requests, including its `/@fs/` route.

## Exporting and sending

With `SITE_URL` configured, run:

```sh
npm run newsletter:export
```

The command writes a timestamped CSV under `data/exports/` (or `NEWSLETTER_DATA_DIR/exports/`) and prints its path and contact count. It requires an existing subscriber database. It exports only subscribed contacts with recorded consent, and includes email, first name, interests, consent wording/version/date, and each contact's `unsubscribe_url`. Cells are quoted and formula-like values are prefixed with an apostrophe for safe spreadsheet viewing; remove that protective prefix only in a trusted import process if your mail provider requires the exact original value.

Import the CSV into your chosen mailing provider when you are ready to send. Include that recipient's unsubscribe URL in every newsletter and re-export before each mailing so website opt-outs are excluded. Also honor any opt-outs collected by the provider itself; this local database and a provider do not automatically synchronize. Connecting a provider directly is a separate integration once a provider/account has been selected.

Unsubscribe URLs use a URL fragment so the token does not enter ordinary HTTP request logs. Opening a link never changes subscription status: the recipient confirms the action and the page sends `POST /api/newsletter/unsubscribe`. The API retains a suppression record. Repeated unsubscribe requests are safe. A previously unsubscribed reader can rejoin by submitting fresh affirmative consent; this updates their preferences and consent record and rotates the unsubscribe token. Old links then return an invalid-link error. Submitting an already active email leaves its data unchanged.

## Collected data and API behavior

The list stores normalized email, optional first name, affirmative consent text/version/timestamp, subscribed status, a random unsubscribe token, and an opt-out timestamp when applicable. The interests field is retained for existing records and API compatibility; the current signup form sends an empty list and does not ask for interests. Email is unique case-insensitively. IP addresses and user agents are not saved with subscribers. The server does not log request bodies, email addresses, or unsubscribe tokens.

`POST /api/newsletter/subscribe` accepts JSON:

```json
{
  "email": "reader@example.com",
  "firstName": "Alex",
  "interests": [],
  "consent": true,
  "website": ""
}
```

`firstName` is optional and interests may be empty. `website` is the hidden honeypot and must be empty. Only a stored subscription or an already recorded address produces `{ "ok": true }`. Invalid input returns HTTP 400 with field errors where applicable; a database failure returns HTTP 503 with a retry message. Existing addresses receive the same response without revealing their membership. There is no public subscriber-list endpoint.

Requests require JSON, have a 4 KB limit, and reject foreign browser origins. Basic rate limiting allows 10 attempts per 15 minutes per client IP per endpoint; it is in memory and resets on restart. Forwarded IP headers are ignored by default. When using exactly one trusted reverse proxy, set `TRUST_PROXY_IP` to its exact socket IP (for example `127.0.0.1`), and configure the proxy to overwrite or append the actual client IP to `X-Forwarded-For`. Only connections from that configured proxy use the rightmost forwarded address. Without this setting, proxied requests share a rate limit. Use an appropriate edge limit for a larger audience.

This is single opt-in: it records the submitted consent but does not verify ownership of an email address. An email delivery provider can add confirmation emails and double opt-in when connected.

Run the focused API/storage/export checks with `npm run test:newsletter`. Tests use temporary databases and do not add test readers to your real list.

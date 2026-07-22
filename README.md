# NyraBiz Dashboard

Business dashboard for [Nyra Wallet](https://nyrawallet.com) — wallet, collections, transfers, team access, and KYB compliance (`/app/compliance`).

## Stack

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query

## Development

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` to your Nyra Wallet API (default local: `http://localhost:2900/api/v1`).

## Build

```bash
npm run build
npm run preview
```

## KYB document upload

Compliance uploads each document to the API as soon as the user selects a file (`POST /business/identities/docs/upload`). **Submit for review** calls `POST /business/identities/docs/submit` after all required documents are on the server.

---

_Last updated: 2026-07-22 — per-file KYB uploads and submit flow._

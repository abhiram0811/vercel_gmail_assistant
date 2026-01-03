# Gmail Assistant

> AI-powered job application tracker that automatically detects and organizes job-related emails from your Gmail.

**Production URL**: [gmail-assistant.vercel.app](https://gmail-assistant.vercel.app)

---

## Features

| Feature | Description |
|---------|-------------|
| **Google OAuth2** | Secure read-only Gmail access |
| **AI Classification** | Gemini 2.0 Flash detects job applications, rejections, interviews |
| **Google Sheets Sync** | Auto-export tracked jobs to your spreadsheet |
| **Scheduled Processing** | QStash-powered automated email processing (hourly/3h/daily) |
| **Serverless** | Deployed on Vercel with Upstash Redis |
| **Modern UI** | Dark/light theme with Tailwind CSS |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│                           │                                      │
│                           ▼                                      │
│                    ┌─────────────┐                               │
│                    │  Dashboard  │                               │
│                    │   (Next.js) │                               │
│                    └──────┬──────┘                               │
│                           │                                      │
├───────────────────────────┼──────────────────────────────────────┤
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    VERCEL (Serverless)                      │  │
│  │                                                             │  │
│  │   /api/auth/*          Auth endpoints (OAuth flow)         │  │
│  │   /api/jobs/track      Manual job tracking trigger         │  │
│  │   /api/settings/*      Schedule configuration              │  │
│  │   /api/cron/*          QStash webhook endpoint             │  │
│  │                                                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                      │
├───────────────────────────┼──────────────────────────────────────┤
│                           ▼                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Gmail     │  │   Gemini    │  │   Google    │              │
│  │    API      │  │     AI      │  │   Sheets    │              │
│  │  (emails)   │  │ (classify)  │  │  (storage)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │  Upstash    │  │   QStash    │                               │
│  │   Redis     │  │ (scheduler) │                               │
│  │  (tokens)   │  │             │                               │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### Job Tracking Flow

```
Gmail API                 Gemini AI               Google Sheets
    │                         │                         │
    │  Fetch emails           │                         │
    │────────────────────────▶│                         │
    │                         │                         │
    │                    Classify each                  │
    │                    email as job                   │
    │                    application?                   │
    │                         │                         │
    │                         │  If job-related         │
    │                         │─────────────────────────▶
    │                         │                    Add/Update row
    │                         │                         │
```

---

## Project Structure

```
gmail-assistant/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/page.tsx          # Main dashboard UI
│   └── api/
│       ├── auth/                   # OAuth: login, callback, logout, status
│       ├── jobs/track/             # Manual job tracking endpoint
│       ├── settings/schedule/      # Schedule configuration API
│       └── cron/process-emails/    # QStash webhook endpoint
├── lib/
│   ├── gmail.ts                    # Gmail API client
│   ├── gemini.ts                   # Gemini AI client
│   ├── jobClassifier.ts            # AI prompt for job detection
│   ├── sheets.ts                   # Google Sheets CRUD
│   ├── kv.ts                       # Upstash Redis token storage
│   ├── qstash.ts                   # QStash schedule management
│   ├── userSettings.ts             # User preferences storage
│   ├── session.ts                  # Cookie session management
│   └── types.ts                    # TypeScript interfaces
└── components/ui/                  # Shadcn/Tailwind components
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud project with OAuth2 credentials
- Upstash Redis database
- Upstash QStash (for scheduled processing)
- Gemini API key

### Local Development

```bash
# 1. Clone and install
cd gmail-assistant
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Yes |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | Yes |
| `UPSTASH_REDIS_REST_URL` | Redis REST endpoint | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token | Yes |
| `GEMINI_API_KEY` | Gemini AI key | Yes |
| `GOOGLE_SHEET_ID` | Target spreadsheet ID | Yes |
| `NEXT_PUBLIC_GOOGLE_SHEET_ID` | Sheet ID for client-side link | Yes |
| `QSTASH_TOKEN` | QStash API token | For scheduling |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash signature verification | For scheduling |
| `QSTASH_NEXT_SIGNING_KEY` | QStash key rotation | For scheduling |
| `CRON_SECRET` | Webhook authentication secret | For scheduling |
| `NEXT_PUBLIC_APP_URL` | App URL for webhook callbacks | For scheduling |

**Local redirect URI**: `http://localhost:3000/api/auth/callback`
**Production redirect URI**: `https://gmail-assistant.vercel.app/api/auth/callback`

---

## Google Cloud Setup

1. **Create project** at [console.cloud.google.com](https://console.cloud.google.com)
2. **Enable APIs**: Gmail API, Google Sheets API
3. **OAuth consent screen**: External, add test users (testing mode limits to 100 users)
4. **Create credentials**: OAuth 2.0 Client ID (Web application)
5. **Add redirect URIs** (both local and production)

---

## Upstash Setup

### Redis (Token Storage)
1. Create database at [console.upstash.com](https://console.upstash.com)
2. Copy REST URL and token to environment variables

### QStash (Scheduled Processing)
1. Create QStash instance in Upstash console
2. Copy token and signing keys
3. Generate a random `CRON_SECRET`:
   ```bash
   openssl rand -hex 32
   ```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Google OAuth2 |
| AI | Gemini 2.0 Flash |
| Token Storage | Upstash Redis |
| Scheduling | Upstash QStash |
| Deployment | Vercel Serverless |

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/login` | GET | Initiate OAuth flow |
| `/api/auth/callback` | GET | OAuth callback handler |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/status` | GET | Check authentication status |
| `/api/jobs/track` | GET | Manually trigger job tracking |
| `/api/settings/schedule` | GET/POST | Get/update schedule settings |
| `/api/cron/process-emails` | POST | QStash webhook endpoint |

---

## Scheduling Options

Users can configure automated email processing frequency:

| Option | Description | Cron Expression |
|--------|-------------|-----------------|
| Manual | Only when clicking button | - |
| Daily | Once per day at 9 AM UTC | `0 9 * * *` |
| Every 3 Hours | 8 times per day | `0 */3 * * *` |
| Hourly | 24 times per day | `0 * * * *` |

---

## Security

- **Read-only Gmail access** (`gmail.readonly` scope)
- **Encrypted token storage** in Upstash Redis
- **httpOnly session cookies**
- **QStash signature verification** for webhook endpoints
- **No email content stored** — only metadata for classification

---

## Known Limitations

- **OAuth Testing Mode**: Tokens expire in 7 days, limited to 100 test users
- **Gemini Rate Limits**: Tier 1 quota, 200ms delay between calls
- **Vercel Function Timeout**: 10 seconds on Hobby plan

---

## License

MIT — Built for personal job tracking use.

---

**Last Updated**: January 2, 2026

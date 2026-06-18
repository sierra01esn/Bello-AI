# Bello AI — Setup Guide
**Fenstermacher24 Google Review Auto-Responder**

---

## What this does
Vercel Cron job runs every hour → fetches new Google Business Profile reviews → generates a warm friendly reply via Claude AI → posts it back to Google automatically.

---

## Step 1 — Google Cloud Console setup

1. Go to https://console.cloud.google.com
2. Create a new project (e.g. "Bello AI")
3. Enable these APIs:
   - **My Business API** (search for it)
   - **Business Profile Performance API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://YOUR-VERCEL-URL.vercel.app/api/auth/callback`
5. Copy your **Client ID** and **Client Secret**

---

## Step 2 — Deploy to Vercel

```bash
git init
git add .
git commit -m "Bello AI initial"
# Push to GitHub, then import in Vercel dashboard
```

Or use Vercel CLI:
```bash
npm i -g vercel
vercel
```

---

## Step 3 — Add environment variables in Vercel

Go to your project → Settings → Environment Variables and add:

| Variable | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | From Step 1 |
| `GOOGLE_CLIENT_SECRET` | From Step 1 |
| `GOOGLE_REDIRECT_URI` | `https://YOUR-URL.vercel.app/api/auth/callback` |
| `GOOGLE_REFRESH_TOKEN` | Get this in Step 4 |
| `GMB_ACCOUNT_ID` | Get this in Step 5 |
| `GMB_LOCATION_ID` | Get this in Step 5 |
| `ANTHROPIC_API_KEY` | From https://console.anthropic.com |
| `CRON_SECRET` | Any random string (e.g. `bello-secret-123`) |
| `REPLY_LANGUAGE` | `German` (or `English`) |

---

## Step 4 — Get your Google refresh token (one time only)

1. Visit: `https://YOUR-URL.vercel.app/api/auth/google`
2. Copy the `authUrl` from the response
3. Open it in your browser → log in with Dario's Google account → Approve
4. You'll be redirected to `/api/auth/callback` → copy the `refresh_token`
5. Save it as `GOOGLE_REFRESH_TOKEN` in Vercel env vars

---

## Step 5 — Find your GMB Account ID and Location ID

```bash
# Set your env vars locally first, then run:
node scripts/find-ids.js
```

Copy the printed `GMB_ACCOUNT_ID` and `GMB_LOCATION_ID` into Vercel.

---

## Step 6 — Enable Vercel KV

1. In Vercel dashboard → your project → **Storage**
2. Click **Create Database → KV**
3. Link it to your project
4. Vercel automatically adds the KV env vars — no extra config needed

---

## Step 7 — Test it manually

Visit: `https://YOUR-URL.vercel.app/api/cron/check-reviews?secret=YOUR_CRON_SECRET`

You should see:
```json
{ "ok": true, "checked": 5, "replied": 1, "skipped": 4, "errors": [] }
```

---

## Step 8 — Watch the dashboard

Visit: `https://YOUR-URL.vercel.app`

The dashboard shows all replies Bello AI has sent, with the original review and generated response.

---

## Cron schedule
Currently set to **daily at 9am Munich time** (`0 8 * * *` UTC) — fits Vercel Hobby free tier.
To change it, edit `vercel.json` → `crons[0].schedule`.

Common alternatives:
- Every 30 min: `*/30 * * * *`
- Every 6 hours: `0 */6 * * *`
- Once a day at 9am: `0 9 * * *`

---

## Cost estimate
- Vercel Hobby (free): includes 2 cron jobs ✅
- Vercel KV (free): 256MB storage ✅
- Anthropic API: ~$0.002 per reply ✅
- Google APIs: free ✅

**Total running cost: ~$0/month for a small business**

---

## File structure
```
bello-ai/
├── api/
│   ├── cron/
│   │   └── check-reviews.js   ← main cron job
│   ├── auth/
│   │   ├── google.js           ← OAuth init
│   │   └── callback.js         ← OAuth callback
│   └── reviews/
│       └── stats.js            ← dashboard API
├── lib/
│   ├── google.js               ← GMB API helpers
│   └── claude.js               ← reply generation
├── scripts/
│   └── find-ids.js             ← find your GMB IDs
├── public/
│   └── index.html              ← live dashboard
├── package.json
└── vercel.json                 ← cron config
```

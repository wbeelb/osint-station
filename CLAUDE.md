# CLAUDE.md — Deployment Instructions for Claude Code

This file contains step-by-step instructions for deploying OSINT Station to GitHub + Vercel (Option B).
Run these instructions from the project root: `D:\AI\web\osint-station`

---

## Prerequisites Checklist

Before starting, confirm:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed and configured (`git --version`)
- [ ] GitHub account exists — username: **[YOUR_GITHUB_USERNAME]**
- [ ] Vercel account exists at vercel.com (can sign in with GitHub)
- [ ] Anthropic API key ready (get from console.anthropic.com)

---

## Step 1 — Install Dependencies & Verify Build

```bash
cd D:\AI\web\osint-station
npm install
npm run build
```

**Expected output:**
```
✓ built in ~250ms
dist/index.html     ~0.6 kB
dist/assets/*.js    ~230 kB
```

If build fails, check Node.js version (must be 18+).

---

## Step 2 — Add API Key for Standalone Use

The app needs your Anthropic API key to call the AI features outside Claude.ai.

### 2a. Create environment file
Create `D:\AI\web\osint-station\.env.local`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

### 2b. Update API calls in src/App.jsx
Find all instances of this fetch header block (there are 2 — one in `handleAiQuery`, one in `handleSanitize`):

```javascript
headers: { "Content-Type": "application/json" },
```

Replace each with:

```javascript
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-ipc": "true",
},
```

### 2c. Verify locally
```bash
npm run dev
```
Open http://localhost:3000 — test AI Analyst tab with a query.

---

## Step 3 — Initialize Git Repository

```bash
cd D:\AI\web\osint-station
git init
git add .
git commit -m "feat: initial OSINT Station deployment"
```

Verify `.env.local` is NOT committed:
```bash
git status
```
`.env.local` should appear as untracked (it's in .gitignore). If it appears staged, run:
```bash
git rm --cached .env.local
```

---

## Step 4 — Create GitHub Repository

### Option A — GitHub CLI (if installed)
```bash
gh repo create osint-station --public --description "Live OSINT intelligence dashboard — Middle East Theater"
git remote add origin https://github.com/YOUR_USERNAME/osint-station.git
git branch -M main
git push -u origin main
```

### Option B — GitHub Web UI
1. Go to https://github.com/new
2. Repository name: `osint-station`
3. Description: `Live OSINT intelligence dashboard — Middle East Theater`
4. Visibility: **Public** (required for free Vercel)
5. Do NOT initialize with README (we already have files)
6. Click **Create repository**
7. Run in terminal:
```bash
git remote add origin https://github.com/YOUR_USERNAME/osint-station.git
git branch -M main
git push -u origin main
```

**Verify:** Visit `https://github.com/YOUR_USERNAME/osint-station` — all files should be visible.

---

## Step 5 — Deploy to Vercel

### 5a. Connect to Vercel
1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub account → find `osint-station` → click **Import**

### 5b. Configure project
Vercel auto-detects Vite. Confirm settings:
- **Framework Preset:** Vite (auto-detected)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### 5c. Add environment variable
Before clicking Deploy:
1. Expand **Environment Variables** section
2. Add:
   - **Name:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-YOUR_KEY_HERE`
   - **Environments:** Production, Preview, Development (check all)
3. Click **Add**

### 5d. Deploy
Click **Deploy** — takes ~30 seconds.

**Result:** Live URL like `https://osint-station-xxxxxx.vercel.app`

---

## Step 6 — Set Custom Domain (Optional)

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Add domain: e.g. `osint.yourdomain.com`
3. Vercel shows DNS record to add
4. At your DNS provider, add:
   - Type: `CNAME`
   - Name: `osint`
   - Value: `cname.vercel-dns.com`
5. Wait 1–5 minutes for propagation

---

## Step 7 — Verify Deployment

Test each feature:

1. **Source Bank** → filter by Iran → should show ~15 sources
2. **AI Analyst** → type "latest news" → should trigger web search (live fetch)
3. **Quote Sanitizer** → click "Araghchi — Hormuz" sample → click SANITIZE → should return JSON analysis
4. **Verify Protocol** → check all links open correctly

---

## Ongoing Maintenance

### Update sources
Edit `src/App.jsx` → `SOURCES` object → commit + push:
```bash
git add src/App.jsx
git commit -m "update: add/remove sources [date]"
git push
```
Vercel auto-deploys on every push to `main`.

### Update model
In `src/App.jsx`, find all `"claude-sonnet-4-20250514"` and replace with new model string.

### Roll back a deploy
In Vercel dashboard → your project → **Deployments** → find previous deploy → **...** → **Promote to Production**

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Build fails with JSX error | Ensure vite.config.js has `@vitejs/plugin-react` plugin |
| API returns 401 Unauthorized | Check VITE_ANTHROPIC_API_KEY in Vercel env vars; redeploy |
| API returns 400 Bad Request | Check `anthropic-dangerous-direct-browser-ipc` header is present |
| Blank page after deploy | Check Vercel build logs; verify `dist/index.html` was generated |
| Sources not showing | Check browser console for JS errors; likely a React render issue |
| CORS error on API call | Add `anthropic-dangerous-direct-browser-ipc: "true"` header |

---

## File Reference

```
D:\AI\web\osint-station\
├── src\
│   ├── App.jsx         ← Main application (edit for source/feature changes)
│   ├── main.jsx        ← Entry point (do not edit)
│   └── index.css       ← Global reset (do not edit)
├── index.html          ← HTML shell with SEO meta tags
├── package.json        ← Dependencies
├── vite.config.js      ← Build config
├── vercel.json         ← SPA routing + security headers
├── .gitignore          ← Excludes node_modules, dist, .env files
├── .env.local          ← YOUR API KEY (never commit this)
├── PLAN.md             ← Full project plan and architecture
└── CLAUDE.md           ← This file
```

---

*Instructions written for Claude Code. All commands assume Windows with Git Bash or PowerShell.*

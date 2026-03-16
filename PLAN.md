# OSINT Station — Middle East Theater
## Project Plan & Architecture

**Version:** 1.0.0  
**Created:** March 2026  
**Status:** Production-ready, awaiting deployment  

---

## 1. Overview

OSINT Station is a public, free-to-use intelligence dashboard for monitoring the Iran / Lebanon / Gaza conflict theater. It consolidates 25 curated OSINT sources, provides an AI-powered analyst with live web search capability, a propaganda quote sanitizer, and a verification protocol reference.

**Live URL (post-deploy):** `https://osint-station.vercel.app` (or custom domain)

---

## 2. Feature Inventory

### Tab 1 — SOURCE BANK
- 25 curated, verified OSINT sources organized in 4 tiers
- **Tier 1 (Real-Time):** Breaking feeds — OSINTWarfare, IntelSky, Aurora Intel, IDF (EN+HE), War Monitor, Middle East Eye
- **Tier 2 (Analytical):** IranWarLive, Global Conflict Awareness, Bellingcat, ISW/CriticalThreats, ICT Meir Amit, ACLED, LiveUAMap, Alma Research
- **Tier 3 (Primary):** Iran International, Al-Monitor, Times of Israel, Jerusalem Post, UN OCHA, Reuters
- **Tier 4 (Geospatial):** Sentinel Hub, NASA FIRMS, Planet Labs, Google Earth Engine
- Filter by theater: All / Gaza / Lebanon / Iran
- Filter by tier: All / T1 / T2 / T3 / T4
- Full-text search across source names and descriptions
- Compact / Expanded view toggle
- All cards are clickable links to the actual source

### Tab 2 — AI ANALYST
- Powered by `claude-sonnet-4-20250514` via Anthropic API
- **Live Fetch mode (default ON):** Equips the analyst with `web_search_20250305` tool
- For time-sensitive queries ("latest", "last hour", "current", "strike", etc.) the model automatically calls web_search before answering
- Results labeled `[LIVE]` vs `[KB]` for transparency
- Real-time fetch progress indicator (step log)
- 6 pre-built quick prompt buttons
- UTC timestamp on every response
- Can be toggled to Knowledge Base Only mode

### Tab 3 — QUOTE SANITIZER
- Paste any official statement from any conflict actor
- AI performs structured propaganda analysis:
  - Extracts factual core (stripped of rhetoric)
  - Identifies propaganda elements by type: emotional_language / false_claim / misleading_omission / false_equivalence / unverifiable
  - Cross-references against documented evidence via web_search
  - Produces corrected objective version with missing context added
  - Reliability score (0–100)
  - "Use with caution" warnings
- 4 pre-loaded sample quotes (Araghchi/Hormuz, Khamenei, Hamas, Hezbollah)
- Output is structured JSON rendered as a formatted intelligence brief

### Tab 4 — VERIFY PROTOCOL
- 8-item verification checklist (OSINT best practices)
- Reliability matrix with visual bars (8 source categories rated 0–100%)
- 5 geolocation quick-tools with direct links (SunCalc, Bellingcat GeoLocator, Google Maps, InVID/WeVerify, What3Words)

---

## 3. Technical Architecture

```
osint-station/
├── src/
│   ├── App.jsx          # Entire application (single-file React component)
│   ├── main.jsx         # React DOM entry point
│   └── index.css        # Minimal reset
├── index.html           # HTML shell with SEO meta tags
├── package.json         # Dependencies: React 18, Vite 6
├── vite.config.js       # Vite build config (output: dist/)
├── vercel.json          # SPA routing rewrites + security headers
├── .gitignore
├── PLAN.md              # This file
└── CLAUDE.md            # Claude Code deployment instructions
```

**Stack:**
- React 18 (no router needed — single page, tab state in useState)
- Vite 6 for build tooling
- Zero UI library dependencies (pure inline styles)
- Anthropic API (`claude-sonnet-4-20250514`) for AI features
- No backend — purely client-side, API calls go directly from browser to Anthropic

**API Usage:**
- Model: `claude-sonnet-4-20250514`
- Max tokens: 1500 (analyst) / 2000 (sanitizer)
- Tools: `web_search_20250305` (enabled when Live Fetch is ON)
- No API key stored in code — relies on Claude.ai artifact proxy for API access

> **⚠️ IMPORTANT:** The Anthropic API calls work without an API key when running inside Claude.ai artifacts. For standalone deployment, you must add your own API key. See Section 6.

---

## 4. Source Curation Notes

### Sources Added (March 2026 verification)
| Source | Status | Verified |
|---|---|---|
| OSINTWarfare (@OSINTWarfare) | ✅ Active | ~95K followers |
| IntelSky (@Intel_Sky) | ✅ Active | ~51K followers, own radar |
| Aurora Intel (@AuroraIntel) | ✅ Active | Middle East focus confirmed |
| IranWarLive (iranwarlive.com) | ✅ Active | Purpose-built for current conflict |
| Global Conflict Awareness | ✅ Active | 89 sources, 5min refresh |
| Times of Israel | ✅ Active | Replaced Haaretz (extreme-left bias) |

### Sources Removed
| Source | Reason |
|---|---|
| Intel Crab (@IntelCrab) | Inactive since ~2024, confirmed via Telegram check |
| Haaretz | Extreme-left editorial bias unsuitable for neutral OSINT use |

### Bias Notes
- Middle East Eye: pro-Palestinian lean — use as signal, verify independently
- Jerusalem Post: right-leaning — good for fast security news, verify editorial claims
- UN OCHA: used for humanitarian data and casualty figures only, not political analysis

---

## 5. Deployment Plan

### Phase 1 — GitHub (manual, ~5 min)
1. Create repo `osint-station` on GitHub (public recommended for free Vercel)
2. Push code from `D:\AI\web\osint-station`
3. Verify repo is clean (no API keys, no node_modules)

### Phase 2 — Vercel (automatic, ~2 min)
1. Connect GitHub repo to Vercel
2. Vercel auto-detects Vite — zero configuration needed
3. Add environment variable: `VITE_ANTHROPIC_API_KEY` (see Section 6)
4. Deploy — first deploy ~30 seconds

### Phase 3 — API Key Configuration
- Required for standalone use outside Claude.ai
- Add to Vercel dashboard: Settings → Environment Variables
- Variable name: `VITE_ANTHROPIC_API_KEY`
- Then update App.jsx API calls to use: `import.meta.env.VITE_ANTHROPIC_API_KEY`

### Phase 4 — Optional Custom Domain
- In Vercel: Settings → Domains → Add domain
- Point DNS CNAME to `cname.vercel-dns.com`

---

## 6. API Key Integration (Required for Standalone)

The app currently calls `https://api.anthropic.com/v1/messages` with no Authorization header, relying on the Claude.ai artifact proxy. For public deployment you must add the key.

**Step 1:** In `src/App.jsx`, find all `fetch("https://api.anthropic.com/v1/messages", {` calls and add the header:

```javascript
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-ipc": "true",  // Required for browser calls
},
```

**Step 2:** Add to `.env.local` for local dev:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

**Step 3:** Add to Vercel environment variables for production.

> **Cost estimate:** Each AI Analyst query ~$0.003–0.008. Quote Sanitizer ~$0.005–0.012. Light usage = pennies/day.

---

## 7. Future Enhancements (Backlog)

### Near-term
- [ ] RSS feed integration — pull latest headlines from Reuters/ISW/IranIntl directly into dashboard
- [ ] Source health monitoring — auto-ping sources and flag if unreachable
- [ ] Persistent chat history for AI Analyst (localStorage)
- [ ] Dark/light mode toggle

### Medium-term
- [ ] Telegram channel monitoring via RSS bridges (RSSHub for Telegram)
- [ ] Strike map — embed IranWarLive or LiveUAMap iframe
- [ ] Export — save AI Analyst responses as PDF
- [ ] Multi-language support (Hebrew UI)

### Long-term
- [ ] Backend API (Node.js/Hono) to proxy Anthropic calls server-side (removes browser API key exposure)
- [ ] Source rating system — community-voted reliability scores
- [ ] Alert system — email/Telegram notification when specific keywords appear in sources
- [ ] Historical archive — timeline of major events with source citations

---

## 8. Maintenance

### Source Verification Schedule
- Monthly: check all 25 sources are still active and relevant
- After major conflict events: review for new high-quality sources
- Quarterly: re-evaluate bias ratings and reliability scores

### Model Updates
- Currently using `claude-sonnet-4-20250514`
- Update model string when newer Sonnet versions release
- Test Quote Sanitizer JSON output format after model updates

---

## 9. Security Notes

- No user data collected, no cookies, no analytics
- API key must NOT be committed to git (use .env.local + Vercel env vars)
- `vercel.json` adds security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff
- All external links open with `target="_blank" rel="noopener noreferrer"`
- No user-submitted content is stored or transmitted anywhere except to Anthropic API

---

*Built March 2026. Maintained by Iulian.*

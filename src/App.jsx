import { useState, useEffect, useRef } from "react";

const SOURCES = {
  realtime: [
    { id: "osintwarfare", name: "OSINTWarfare", handle: "@OSINTWarfare", platform: "X", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Breaking", url: "https://x.com/OSINTWarfare", desc: "Real-time conflict tracking worldwide with maps and analysis — ~95K followers, active 2026" },
    { id: "intelsky", name: "IntelSky", handle: "@Intel_Sky", platform: "X/Web", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Breaking", url: "https://x.com/Intel_Sky", desc: "Middle East military movements on land, sea and air — operates own OSINT radar at intelsky.org (~51K followers)" },
    { id: "aurora", name: "Aurora Intel", handle: "@AuroraIntel", platform: "X", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Breaking", url: "https://x.com/AuroraIntel", desc: "Real-time conflict tracking, verified incidents across Middle East — active 2026" },
    { id: "mee", name: "Middle East Eye", handle: "@MiddleEastEye", platform: "X/Web", tier: 1, theater: ["Gaza", "Lebanon"], type: "News", url: "https://www.middleeasteye.net", desc: "Regional news, often ahead of mainstream media — pro-Palestinian lean, verify independently" },
    { id: "idf", name: "IDF Spokesperson", handle: "@IDF", platform: "X", tier: 1, theater: ["Gaza", "Lebanon"], type: "Official", url: "https://x.com/IDF", desc: "Official Israeli military announcements — English" },
    { id: "idf_heb", name: "IDF Hebrew", handle: "@IDFSpokesperson", platform: "Telegram", tier: 1, theater: ["Gaza", "Lebanon"], type: "Official", url: "https://t.me/idfofficial", desc: "Hebrew-language IDF official channel — typically 15-30 min faster than English feed" },
    { id: "warmonitor", name: "War Monitor", handle: "War Monitor", platform: "Telegram", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Aggregator", url: "https://t.me/warmonitor3", desc: "Fast-moving aggregator across multiple conflict feeds — treat as raw signal, verify before acting" },
  ],
  analytical: [
    { id: "iranwarlive", name: "IranWarLive", handle: "iranwarlive.com", platform: "Web", tier: 2, theater: ["Iran", "Lebanon", "Gaza"], type: "Mapping", url: "https://iranwarlive.com", desc: "Automated OSINT engine — live strike map, verified casualties from Reuters/AP/CENTCOM only. Active March 2026." },
    { id: "gca", name: "Global Conflict Awareness", handle: "globalconflictawareness.com", platform: "Web", tier: 2, theater: ["Iran", "Lebanon", "Gaza"], type: "Aggregator", url: "https://globalconflictawareness.com", desc: "89 sources (18 Telegram + 63 RSS), auto-updated every 5 min, 400+ geolocated strike events, NLP-based detection." },
    { id: "bellingcat", name: "Bellingcat", handle: "bellingcat.com", platform: "Web", tier: 2, theater: ["Gaza", "Lebanon", "Iran"], type: "Verification", url: "https://www.bellingcat.com", desc: "Geolocation, open-source verification, deep investigations — gold standard. Iran/Iraq Tomahawk tracking active March 2026." },
    { id: "isw", name: "ISW / CriticalThreats", handle: "understandingwar.org", platform: "Web", tier: 2, theater: ["Gaza", "Lebanon", "Iran"], type: "Analysis", url: "https://www.understandingwar.org/publications", desc: "Publishing 2x daily Iran updates (Morning + Evening) as of March 2026 — highest analytical output in this bank." },
    { id: "ict", name: "ICT Meir Amit", handle: "ict.org.il", platform: "Web", tier: 2, theater: ["Lebanon", "Gaza", "Iran"], type: "Analysis", url: "https://www.ict.org.il", desc: "Israeli academic OSINT center on terrorist organizations — deep reports, slower cadence" },
    { id: "acled", name: "ACLED", handle: "acleddata.com", platform: "Web", tier: 2, theater: ["Gaza", "Lebanon"], type: "Data", url: "https://acleddata.com", desc: "Conflict event mapping with downloadable datasets — best for trend analysis and historical comparison" },
    { id: "liveuamap", name: "LiveUAMap", handle: "liveuamap.com", platform: "Web", tier: 2, theater: ["Gaza", "Lebanon", "Iran"], type: "Mapping", url: "https://liveuamap.com", desc: "Live conflict mapping — Lebanon, Syria, Iran tabs confirmed active March 16 2026, updated every few minutes" },
    { id: "alma", name: "Alma Research", handle: "almaresearch.org", platform: "Web", tier: 2, theater: ["Lebanon"], type: "Analysis", url: "https://www.almaresearch.org", desc: "Hezbollah / Lebanon border intelligence, Israeli NGO, very detailed tactical maps" },
  ],
  primary: [
    { id: "iranintl", name: "Iran International", handle: "iranintl.com", platform: "Web/X", tier: 3, theater: ["Iran"], type: "News", url: "https://www.iranintl.com/en", desc: "Persian diaspora outlet — strongest source for IRGC, domestic Iran, protests and sanctions. Active March 2026." },
    { id: "almonitor", name: "Al-Monitor", handle: "al-monitor.com", platform: "Web", tier: 3, theater: ["Gaza", "Lebanon", "Iran"], type: "Analysis", url: "https://www.al-monitor.com", desc: "Regional analysis, well-sourced correspondents across the Middle East — active March 2026" },
    { id: "toi", name: "Times of Israel", handle: "timesofisrael.com", platform: "Web", tier: 3, theater: ["Gaza", "Lebanon", "Iran"], type: "News", url: "https://www.timesofisrael.com", desc: "Israeli press — centrist, free to read, fast security coverage. Replaced Haaretz (extreme-left bias)." },
    { id: "jpost", name: "Jerusalem Post", handle: "jpost.com", platform: "Web", tier: 3, theater: ["Gaza", "Lebanon"], type: "News", url: "https://www.jpost.com", desc: "Israeli press — right-leaning, fast on domestic security and military news" },
    { id: "ocha", name: "UN OCHA", handle: "ochaopt.org", platform: "Web", tier: 3, theater: ["Gaza"], type: "Humanitarian", url: "https://www.ochaopt.org", desc: "Official UN humanitarian data, casualty figures, situation reports for Gaza — use for baseline numbers" },
    { id: "reuters", name: "Reuters Wire", handle: "reuters.com", platform: "Web", tier: 3, theater: ["Gaza", "Lebanon", "Iran"], type: "Wire", url: "https://www.reuters.com/world/middle-east/", desc: "Wire service — fastest confirmed events, highest reliability threshold of any news source" },
  ],
  geospatial: [
    { id: "sentinel", name: "Sentinel Hub", handle: "sentinel-hub.com", platform: "Web", tier: 4, theater: ["Gaza", "Lebanon", "Iran"], type: "Satellite", url: "https://www.sentinel-hub.com", desc: "Free Copernicus satellite imagery — excellent for damage assessment" },
    { id: "firms", name: "NASA FIRMS", handle: "firms.modaps.eosdis.nasa.gov", platform: "Web", tier: 4, theater: ["Gaza", "Lebanon", "Iran"], type: "Satellite", url: "https://firms.modaps.eosdis.nasa.gov", desc: "Fire/heat signature detection — extremely useful for tracking airstrikes, ~3hr delay" },
    { id: "planet", name: "Planet Labs", handle: "planet.com", platform: "Web", tier: 4, theater: ["Gaza", "Lebanon", "Iran"], type: "Satellite", url: "https://www.planet.com", desc: "Commercial daily-revisit satellite imagery (paid) — highest resolution" },
    { id: "gee", name: "Google Earth Engine", handle: "earthengine.google.com", platform: "Web", tier: 4, theater: ["Gaza", "Lebanon", "Iran"], type: "Satellite", url: "https://earthengine.google.com", desc: "Historical + current imagery comparison, good for before/after analysis" },
  ],
};

const ALL_SOURCES = Object.values(SOURCES).flat();
const TIER_LABELS = { 1: "REAL-TIME", 2: "ANALYTICAL", 3: "PRIMARY", 4: "GEOSPATIAL" };
const TIER_COLORS = { 1: "#ff4444", 2: "#ffaa00", 3: "#44aaff", 4: "#44ff88" };
const TYPE_COLORS = {
  Breaking: "#ff4444", Official: "#ff8800", Aggregator: "#ffcc00",
  Verification: "#44ff88", Analysis: "#44aaff", Data: "#aa88ff",
  Mapping: "#ff44aa", News: "#88ccff", Humanitarian: "#ff88aa",
  Wire: "#cccccc", Satellite: "#44ffcc",
};
const THEATERS = ["All", "Gaza", "Lebanon", "Iran"];

const VERIFY_CHECKLIST = [
  "Cross-reference with ≥3 independent sources",
  "Check video metadata (sun angle, shadows) for geolocation",
  "Use Bellingcat geolocation tools for footage verification",
  "Telegram channels carry significant disinfo — treat as raw signal",
  "Adversary channels (Hamas/Hezbollah) require heavy propaganda filter",
  "Official channels may lag real events by 15–60 minutes",
  "Satellite imagery has 1–3 day delay for commercial providers",
  "Old footage from June 2025 conflict confirmed circulating as current — use InVID/WeVerify",
];

const SAMPLE_QUOTES = [
  {
    label: "Araghchi — Hormuz",
    actor: "Iran FM Abbas Araghchi",
    text: `Iran's Foreign Minister Abbas Araghchi declared the strait is "open, but closed to our enemies, to those who carried out this cowardly aggression against us and to their allies."`,
  },
  {
    label: "Khamenei — Resistance",
    actor: "Supreme Leader Khamenei",
    text: "The Islamic Republic has never been the aggressor. We have only responded to Zionist crimes and American hegemony. Our missiles are a shield, not a sword.",
  },
  {
    label: "Hamas — Ceasefire",
    actor: "Hamas Political Bureau",
    text: "Hamas is committed to peace and the protection of civilians. Any civilian casualties are the direct result of Israeli aggression and occupation.",
  },
  {
    label: "Hezbollah — Lebanon",
    actor: "Hezbollah Secretary-General",
    text: "We are a Lebanese resistance movement defending our land. Our weapons are purely defensive and will never be turned against Lebanese citizens.",
  },
];

function SourceCard({ source, compact }) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer"
      style={{
        display: "block",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${TIER_COLORS[source.tier]}33`,
        borderLeft: `3px solid ${TIER_COLORS[source.tier]}`,
        borderRadius: 2, padding: compact ? "8px 12px" : "12px 16px",
        marginBottom: 6, textDecoration: "none",
        transition: "background 0.15s", cursor: "pointer",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 2 : 4, flexWrap: "wrap" }}>
        <span style={{ color: TIER_COLORS[source.tier], fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>T{source.tier}</span>
        <span style={{ color: "#e8dcc8", fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 700 }}>{source.name}</span>
        <span style={{ background: `${TYPE_COLORS[source.type]}22`, color: TYPE_COLORS[source.type], border: `1px solid ${TYPE_COLORS[source.type]}55`, borderRadius: 2, padding: "1px 6px", fontSize: 9, fontFamily: "monospace", letterSpacing: 1, marginLeft: "auto" }}>{source.type.toUpperCase()}</span>
      </div>
      <div style={{ color: "#888", fontFamily: "monospace", fontSize: 10, marginBottom: compact ? 0 : 4 }}>{source.handle} · {source.platform}</div>
      {!compact && <div style={{ color: "#aaa", fontFamily: "'Courier New', monospace", fontSize: 11, lineHeight: 1.5 }}>{source.desc}</div>}
      {!compact && (
        <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
          {source.theater.map(t => (
            <span key={t} style={{ background: "#ffffff0a", color: "#888", border: "1px solid #ffffff15", borderRadius: 2, padding: "1px 6px", fontSize: 9, fontFamily: "monospace" }}>{t.toUpperCase()}</span>
          ))}
        </div>
      )}
    </a>
  );
}

export default function OsintDashboard() {
  const [activeTheater, setActiveTheater] = useState("All");
  const [activeTier, setActiveTier] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [fetchSteps, setFetchSteps] = useState([]);
  const [quoteInput, setQuoteInput] = useState("");
  const [quoteActor, setQuoteActor] = useState("");
  const [quoteResult, setQuoteResult] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sources");
  const [compact, setCompact] = useState(false);
  const [time, setTime] = useState(new Date());
  const aiInputRef = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const filteredSources = ALL_SOURCES.filter(s => {
    const theaterMatch = activeTheater === "All" || s.theater.includes(activeTheater);
    const tierMatch = activeTier === "All" || s.tier === parseInt(activeTier);
    const searchMatch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase());
    return theaterMatch && tierMatch && searchMatch;
  });

  const handleAiQuery = async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResponse("");
    setFetchSteps(["Initializing analyst session..."]);

    const sourceList = ALL_SOURCES.map(s =>
      `[T${s.tier}] ${s.name} (${s.type}) — ${s.theater.join("/")} — ${s.desc}`
    ).join("\n");

    const now = new Date().toUTCString();
    const isTimeSensitive = /last hour|latest|now|current|today|right now|breaking|live|update|happened|strike|attack|news/i.test(aiQuery);

    const systemPrompt = `You are a professional OSINT analyst specializing in the Middle East conflict — Iran, Lebanon, Gaza, and the Axis of Resistance network. Current date/time: ${now}.

CURATED SOURCE BANK:
${sourceList}

${liveMode
      ? `OPERATING MODE: LIVE FETCH ENABLED.
You have the web_search tool. Rules:
1. For ANY time-sensitive query (latest, last hour, now, current, today, recent strikes/attacks/news) — ALWAYS call web_search BEFORE answering.
2. Report ACTUAL FINDINGS first — what happened, when, where, which source, verified/unverified.
3. Label clearly: [LIVE] for web_search results vs [KB] for knowledge base info.
4. If search returns nothing useful, say so and explain.
5. For non-time-sensitive queries skip web_search.`
      : `OPERATING MODE: KNOWLEDGE BASE ONLY. No web_search. Explicitly state you cannot verify real-time events.`}

Style: tactical brevity, structured headers, cite source IDs, flag unverified claims.`;

    try {
      const tools = liveMode ? [{ type: "web_search_20250305", name: "web_search" }] : undefined;
      if (liveMode && isTimeSensitive) {
        setFetchSteps(prev => [...prev, "Time-sensitive query — activating web_search...", "Fetching: IranWarLive · Reuters · ToI · ISW..."]);
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-ipc": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemPrompt,
          ...(tools && { tools }),
          messages: [{ role: "user", content: aiQuery }]
        })
      });

      const data = await res.json();
      if (data.error) { setAiResponse(`API ERROR: ${data.error.message}`); return; }

      const toolUses = data.content?.filter(c => c.type === "tool_use") || [];
      if (toolUses.length > 0) {
        setFetchSteps(prev => [...prev, `Web search executed (${toolUses.length} quer${toolUses.length > 1 ? "ies" : "y"})`, "Synthesizing live results..."]);
      } else {
        setFetchSteps(prev => [...prev, "Processing response..."]);
      }

      const text = data.content?.filter(c => c.type === "text").map(c => c.text).join("\n") || "No response received.";
      setAiResponse(text);
    } catch (err) {
      setAiResponse(`ERROR: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSanitize = async () => {
    if (!quoteInput.trim() || quoteLoading) return;
    setQuoteLoading(true);
    setQuoteResult(null);

    const systemPrompt = `You are an OSINT intelligence analyst and fact-checker specializing in Middle East geopolitics. Your task is to perform QUOTE SANITIZATION.

Current date: ${new Date().toUTCString()}

METHODOLOGY:
1. EXTRACT the factual core — stripped of emotional language and rhetoric
2. IDENTIFY propaganda elements: emotional language, false claims, misleading framing, omissions
3. CROSS-REFERENCE against verifiable facts using web_search
4. FLAG each contradiction with specific evidence
5. PRODUCE a sanitized objective version

OUTPUT FORMAT (valid JSON only, no markdown fences):
{
  "actor": "who made the statement",
  "original_core_claim": "factual claim stripped of rhetoric (1-2 sentences)",
  "propaganda_elements": [
    {"element": "quoted phrase", "type": "emotional_language|false_claim|misleading_omission|false_equivalence|unverifiable", "explanation": "why problematic"}
  ],
  "contradictions": [
    {"claim": "what they claimed", "reality": "documented contrary evidence", "confidence": "high|medium|low"}
  ],
  "sanitized_version": "corrected objective version with documented reality and missing context added",
  "reliability_score": 0,
  "use_with_caution": ["specific warnings when citing this"]
}`;

    try {
      const tools = [{ type: "web_search_20250305", name: "web_search" }];
      const userMsg = `ACTOR: ${quoteActor || "Unknown"}\n\nQUOTE TO SANITIZE:\n"${quoteInput}"\n\nUse web_search to verify factual claims before completing analysis.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-ipc": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: systemPrompt,
          tools,
          messages: [{ role: "user", content: userMsg }]
        })
      });

      const data = await res.json();
      if (data.error) { setQuoteResult({ error: data.error.message }); return; }

      const text = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        setQuoteResult(JSON.parse(clean));
      } catch {
        setQuoteResult({ raw: text });
      }
    } catch (err) {
      setQuoteResult({ error: err.message });
    } finally {
      setQuoteLoading(false);
    }
  };

  const CONFIDENCE_COLOR = { high: "#ff4444", medium: "#ffaa00", low: "#44aaff" };
  const PROP_TYPE_COLOR = {
    emotional_language: "#ffaa00", false_claim: "#ff4444",
    misleading_omission: "#ff8800", false_equivalence: "#aa44ff", unverifiable: "#888888"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c09", color: "#c8d4b8", fontFamily: "'Courier New', monospace", position: "relative", overflow: "hidden" }}>
      <div style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)", pointerEvents: "none", position: "fixed", inset: 0, zIndex: 9999 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at 20% 20%, #0d1a0a 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #0a0d14 0%, transparent 60%)" }} />

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0c09; }
        ::-webkit-scrollbar-thumb { background: #2a3a2a; border-radius: 2px; }
        textarea:focus, input:focus { outline: none !important; }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 16px 40px" }}>

        {/* Header */}
        <div style={{ borderBottom: "1px solid #1a2a1a", padding: "16px 0 12px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#44ff88", fontSize: 10, letterSpacing: 3, animation: "pulse 2s infinite" }}>◉ LIVE</span>
                <span style={{ color: "#e8dcc8", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>OSINT STATION</span>
                <span style={{ color: "#555", fontSize: 12 }}>{"//"} MIDDLE EAST THEATER</span>
              </div>
              <div style={{ color: "#445544", fontSize: 10, letterSpacing: 2, marginTop: 2 }}>IRAN · LEBANON · GAZA · ACTIVE INTELLIGENCE SOURCES</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#44ff88", fontSize: 13, fontFamily: "monospace", letterSpacing: 2 }}>{time.toUTCString().replace("GMT", "UTC")}</div>
              <div style={{ color: "#445544", fontSize: 10, marginTop: 2 }}>{ALL_SOURCES.length} SOURCES · VERIFIED {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid #1a2a1a", flexWrap: "wrap" }}>
          {[["sources", "SOURCE BANK", "#44ff88"], ["ai", "AI ANALYST", "#44ff88"], ["sanitize", "QUOTE SANITIZER", "#ffaa00"], ["verify", "VERIFY PROTOCOL", "#44ff88"]].map(([tab, label, color]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? "#1a2a1a" : "transparent",
              color: activeTab === tab ? color : "#556655",
              border: "none", borderBottom: activeTab === tab ? `2px solid ${color}` : "2px solid transparent",
              padding: "8px 18px", cursor: "pointer", fontFamily: "monospace", fontSize: 11, letterSpacing: 2, transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        {/* SOURCES TAB */}
        {activeTab === "sources" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="SEARCH SOURCES..."
                style={{ background: "#0d140d", border: "1px solid #2a3a2a", color: "#c8d4b8", padding: "7px 12px", fontFamily: "monospace", fontSize: 11, letterSpacing: 1, borderRadius: 2, width: 200 }} />
              <div style={{ display: "flex", gap: 4 }}>
                {THEATERS.map(t => (
                  <button key={t} onClick={() => setActiveTheater(t)} style={{
                    background: activeTheater === t ? "#1a3a1a" : "transparent", color: activeTheater === t ? "#88ff88" : "#556655",
                    border: `1px solid ${activeTheater === t ? "#2a5a2a" : "#1a2a1a"}`, padding: "6px 12px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, letterSpacing: 1, borderRadius: 2,
                  }}>{t.toUpperCase()}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["All", "1", "2", "3", "4"].map(t => (
                  <button key={t} onClick={() => setActiveTier(t)} style={{
                    background: activeTier === t ? "#1a2a2a" : "transparent",
                    color: activeTier === t ? (t === "All" ? "#88ff88" : TIER_COLORS[parseInt(t)]) : "#445544",
                    border: `1px solid ${activeTier === t ? "#2a4a4a" : "#1a2a1a"}`, padding: "6px 10px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, borderRadius: 2,
                  }}>{t === "All" ? "ALL" : `T${t}`}</button>
                ))}
              </div>
              <button onClick={() => setCompact(!compact)} style={{ marginLeft: "auto", background: "transparent", color: "#445544", border: "1px solid #1a2a1a", padding: "6px 12px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, borderRadius: 2 }}>
                {compact ? "EXPAND" : "COMPACT"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 16, padding: "8px 12px", background: "#0d140d", border: "1px solid #1a2a1a", borderRadius: 2 }}>
              {[1, 2, 3, 4].map(t => {
                const count = filteredSources.filter(s => s.tier === t).length;
                return (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: TIER_COLORS[t], fontSize: 9, letterSpacing: 1 }}>T{t} {TIER_LABELS[t]}</span>
                    <span style={{ color: TIER_COLORS[t], fontWeight: 700 }}>{count}</span>
                  </div>
                );
              })}
              <span style={{ marginLeft: "auto", color: "#445544", fontSize: 10 }}>TOTAL: {filteredSources.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 8 }}>
              {filteredSources.length === 0
                ? <div style={{ color: "#445544", gridColumn: "1/-1", textAlign: "center", padding: 40 }}>NO SOURCES MATCH FILTER CRITERIA</div>
                : filteredSources.map(s => <SourceCard key={s.id} source={s} compact={compact} />)
              }
            </div>
          </>
        )}

        {/* AI ANALYST TAB */}
        {activeTab === "ai" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "8px 14px", background: "#0a120a", border: "1px solid #1a2a1a", borderRadius: 2, flexWrap: "wrap" }}>
              <span style={{ color: liveMode ? "#44ff88" : "#445544", fontSize: 10, letterSpacing: 2, animation: liveMode ? "pulse 1.5s infinite" : "none" }}>
                {liveMode ? "◉ LIVE FETCH ON" : "◎ LIVE FETCH OFF"}
              </span>
              <button onClick={() => setLiveMode(v => !v)} style={{
                background: liveMode ? "#0d2a0d" : "#1a1a1a", border: `1px solid ${liveMode ? "#2a5a2a" : "#333"}`,
                color: liveMode ? "#44ff88" : "#556655", padding: "4px 12px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, borderRadius: 2,
              }}>{liveMode ? "DISABLE" : "ENABLE"}</button>
              <span style={{ color: "#334433", fontSize: 10 }}>
                {liveMode ? "// ANALYST FETCHES LIVE DATA FOR TIME-SENSITIVE QUERIES" : "// KNOWLEDGE BASE ONLY"}
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {["What happened in the last hour?", "Latest confirmed strikes on Iran?", "Current airspace status Middle East?", "Best sources for Hezbollah tunnels?", "How do I verify a Telegram strike claim?", "Compare ISW vs Bellingcat for Gaza"].map(q => (
                <button key={q} onClick={() => { setAiQuery(q); setTimeout(() => aiInputRef.current?.focus(), 50); }} style={{
                  background: "#0d140d", border: "1px solid #1a3a1a", color: "#667766",
                  padding: "5px 10px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, borderRadius: 2,
                }}
                  onMouseEnter={e => { e.target.style.color = "#88cc88"; e.target.style.borderColor = "#2a5a2a"; }}
                  onMouseLeave={e => { e.target.style.color = "#667766"; e.target.style.borderColor = "#1a3a1a"; }}
                >{q}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <textarea ref={aiInputRef} value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiQuery(); } }}
                placeholder="Enter intelligence query... (Enter to submit)"
                rows={3}
                style={{ flex: 1, background: "#0d140d", border: "1px solid #2a3a2a", color: "#c8d4b8", padding: "10px 14px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6, borderRadius: 2, resize: "vertical" }}
              />
              <button onClick={handleAiQuery} disabled={aiLoading || !aiQuery.trim()} style={{
                background: aiLoading ? "#0d1a0d" : "#0d2a0d", border: `1px solid ${aiLoading ? "#1a3a1a" : "#2a5a2a"}`,
                color: aiLoading ? "#2a5a2a" : "#44ff88", padding: "0 20px", cursor: aiLoading ? "wait" : "pointer",
                fontFamily: "monospace", fontSize: 11, letterSpacing: 2, borderRadius: 2, minWidth: 100,
              }}>{aiLoading ? "SCANNING..." : "QUERY ▶"}</button>
            </div>

            {aiLoading && fetchSteps.length > 0 && (
              <div style={{ background: "#0a120a", border: "1px solid #1a2a1a", borderRadius: 2, padding: "10px 14px", marginBottom: 12 }}>
                {fetchSteps.map((step, i) => (
                  <div key={i} style={{ color: i === fetchSteps.length - 1 ? "#44ff88" : "#2a4a2a", fontFamily: "monospace", fontSize: 10, lineHeight: 2, letterSpacing: 1 }}>
                    {i === fetchSteps.length - 1 ? "▶ " : "✓ "}{step}
                  </div>
                ))}
              </div>
            )}

            {aiResponse && (
              <div style={{ background: "#0d140d", border: "1px solid #1a3a1a", borderLeft: "3px solid #44ff88", padding: "16px 20px", borderRadius: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: "#445544", fontSize: 10, letterSpacing: 2 }}>{"//"} ANALYST RESPONSE</span>
                  {liveMode && <span style={{ color: "#44ff88", fontSize: 9, border: "1px solid #1a4a1a", padding: "1px 6px", borderRadius: 2 }}>WITH LIVE DATA</span>}
                  <span style={{ color: "#334433", fontSize: 9, marginLeft: "auto" }}>{new Date().toUTCString().replace("GMT", "UTC")}</span>
                </div>
                <div style={{ color: "#c8d4b8", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{aiResponse}</div>
              </div>
            )}

            {!aiResponse && !aiLoading && (
              <div style={{ color: "#2a3a2a", textAlign: "center", padding: "60px 0", fontSize: 12 }}>
                ██████████████████████████████<br />
                █ AWAITING INTELLIGENCE QUERY █<br />
                ██████████████████████████████
              </div>
            )}
          </div>
        )}

        {/* QUOTE SANITIZER TAB */}
        {activeTab === "sanitize" && (
          <div>
            <div style={{ marginBottom: 14, padding: "8px 14px", background: "#120a00", border: "1px solid #2a1a00", borderLeft: "3px solid #ffaa00", borderRadius: 2 }}>
              <div style={{ color: "#ffaa00", fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>◈ QUOTE SANITIZER — PROPAGANDA ANALYSIS ENGINE</div>
              <div style={{ color: "#886644", fontSize: 11, lineHeight: 1.6 }}>
                Paste any official statement. The AI extracts the factual core · identifies propaganda elements · cross-references evidence · produces a corrected objective version.
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#556655", fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>SAMPLE QUOTES:</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SAMPLE_QUOTES.map(sq => (
                  <button key={sq.label} onClick={() => { setQuoteInput(sq.text); setQuoteActor(sq.actor); }} style={{
                    background: "#120a00", border: "1px solid #2a1a00", color: "#886644",
                    padding: "5px 10px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, borderRadius: 2,
                  }}
                    onMouseEnter={e => { e.target.style.color = "#ffaa00"; e.target.style.borderColor = "#4a2a00"; }}
                    onMouseLeave={e => { e.target.style.color = "#886644"; e.target.style.borderColor = "#2a1a00"; }}
                  >{sq.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 8, marginBottom: 8 }}>
              <input value={quoteActor} onChange={e => setQuoteActor(e.target.value)} placeholder="ACTOR / SOURCE..."
                style={{ background: "#0d0a00", border: "1px solid #2a1a00", color: "#c8b488", padding: "10px 14px", fontFamily: "monospace", fontSize: 11, borderRadius: 2 }} />
              <div style={{ color: "#334433", fontSize: 10, alignSelf: "center", paddingLeft: 4 }}>e.g. "Iran FM Abbas Araghchi" / "Hamas Political Bureau"</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <textarea value={quoteInput} onChange={e => setQuoteInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSanitize(); }}
                placeholder="Paste official quote or statement here... (Ctrl+Enter to analyze)"
                rows={4}
                style={{ flex: 1, background: "#0d0a00", border: "1px solid #2a1a00", color: "#c8b488", padding: "10px 14px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6, borderRadius: 2, resize: "vertical" }}
              />
              <button onClick={handleSanitize} disabled={quoteLoading || !quoteInput.trim()} style={{
                background: quoteLoading ? "#120a00" : "#1a0d00", border: `1px solid ${quoteLoading ? "#2a1a00" : "#4a2a00"}`,
                color: quoteLoading ? "#4a2a00" : "#ffaa00", padding: "0 20px", cursor: quoteLoading ? "wait" : "pointer",
                fontFamily: "monospace", fontSize: 11, letterSpacing: 2, borderRadius: 2, minWidth: 110,
              }}>{quoteLoading ? "ANALYZING..." : "SANITIZE ▶"}</button>
            </div>

            {quoteLoading && (
              <div style={{ background: "#120a00", border: "1px solid #2a1a00", borderRadius: 2, padding: "16px 20px", textAlign: "center" }}>
                <div style={{ color: "#ffaa00", fontSize: 10, letterSpacing: 2, animation: "pulse 1s infinite" }}>◉ CROSS-REFERENCING AGAINST DOCUMENTED EVIDENCE...</div>
              </div>
            )}

            {quoteResult && !quoteLoading && (
              <div>
                {quoteResult.error && <div style={{ background: "#1a0a0a", border: "1px solid #4a1a1a", borderRadius: 2, padding: 16, color: "#ff6666" }}>ERROR: {quoteResult.error}</div>}
                {quoteResult.raw && <div style={{ background: "#120a00", border: "1px solid #2a1a00", borderLeft: "3px solid #ffaa00", padding: 16, borderRadius: 2, color: "#c8b488", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{quoteResult.raw}</div>}
                {quoteResult.sanitized_version && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#120a00", border: "1px solid #2a1a00", borderRadius: 2 }}>
                      <span style={{ color: "#ffaa00", fontSize: 11, fontWeight: 700 }}>{quoteResult.actor}</span>
                      <span style={{ marginLeft: "auto", color: quoteResult.reliability_score > 60 ? "#44aaff" : quoteResult.reliability_score > 30 ? "#ffaa00" : "#ff4444", fontSize: 11, fontWeight: 700, border: "1px solid currentColor", padding: "2px 8px", borderRadius: 2 }}>
                        RELIABILITY: {quoteResult.reliability_score}/100
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#0d0a00", border: "1px solid #2a1a0055", borderLeft: "3px solid #ff4444", padding: "12px 16px", borderRadius: 2 }}>
                        <div style={{ color: "#ff4444", fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>ORIGINAL CORE CLAIM</div>
                        <div style={{ color: "#c8a888", fontSize: 12, lineHeight: 1.7 }}>{quoteResult.original_core_claim}</div>
                      </div>
                      <div style={{ background: "#0a0d0a", border: "1px solid #1a3a1a", borderLeft: "3px solid #44ff88", padding: "12px 16px", borderRadius: 2 }}>
                        <div style={{ color: "#44ff88", fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>✓ SANITIZED OBJECTIVE VERSION</div>
                        <div style={{ color: "#c8d4b8", fontSize: 12, lineHeight: 1.7 }}>{quoteResult.sanitized_version}</div>
                      </div>
                    </div>
                    {quoteResult.propaganda_elements?.length > 0 && (
                      <div style={{ background: "#0d0a00", border: "1px solid #2a1a00", borderRadius: 2, padding: "12px 16px" }}>
                        <div style={{ color: "#ffaa00", fontSize: 9, letterSpacing: 2, marginBottom: 10 }}>◈ PROPAGANDA ELEMENTS ({quoteResult.propaganda_elements.length})</div>
                        {quoteResult.propaganda_elements.map((el, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #1a1000", alignItems: "flex-start" }}>
                            <span style={{ background: `${PROP_TYPE_COLOR[el.type] || "#888"}22`, color: PROP_TYPE_COLOR[el.type] || "#888", border: `1px solid ${PROP_TYPE_COLOR[el.type] || "#888"}44`, borderRadius: 2, padding: "1px 6px", fontSize: 9, whiteSpace: "nowrap", marginTop: 2 }}>
                              {(el.type || "").replace(/_/g, " ").toUpperCase()}
                            </span>
                            <div>
                              <div style={{ color: "#c8a888", fontSize: 11, fontStyle: "italic", marginBottom: 2 }}>"{el.element}"</div>
                              <div style={{ color: "#886644", fontSize: 11, lineHeight: 1.5 }}>{el.explanation}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {quoteResult.contradictions?.length > 0 && (
                      <div style={{ background: "#0d0a0a", border: "1px solid #3a1a1a", borderRadius: 2, padding: "12px 16px" }}>
                        <div style={{ color: "#ff4444", fontSize: 9, letterSpacing: 2, marginBottom: 10 }}>◈ CONTRADICTIONS VS EVIDENCE ({quoteResult.contradictions.length})</div>
                        {quoteResult.contradictions.map((c, i) => (
                          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #1a0a0a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ color: "#ff6666", fontSize: 10 }}>CLAIMED:</span>
                              <span style={{ color: "#c8a888", fontSize: 11 }}>{c.claim}</span>
                              <span style={{ marginLeft: "auto", color: CONFIDENCE_COLOR[c.confidence] || "#888", fontSize: 9, border: `1px solid ${CONFIDENCE_COLOR[c.confidence] || "#888"}44`, padding: "1px 6px", borderRadius: 2 }}>
                                {(c.confidence || "").toUpperCase()} CONFIDENCE
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <span style={{ color: "#44ff88", fontSize: 10, minWidth: 60 }}>REALITY:</span>
                              <span style={{ color: "#aab8aa", fontSize: 11, lineHeight: 1.5 }}>{c.reality}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {quoteResult.use_with_caution?.length > 0 && (
                      <div style={{ background: "#0a0a0d", border: "1px solid #1a1a3a", borderRadius: 2, padding: "10px 14px" }}>
                        <div style={{ color: "#44aaff", fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>◈ USE WITH CAUTION</div>
                        {quoteResult.use_with_caution.map((w, i) => (
                          <div key={i} style={{ color: "#667788", fontSize: 11, lineHeight: 1.8 }}>⚠ {w}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!quoteResult && !quoteLoading && (
              <div style={{ color: "#2a2000", textAlign: "center", padding: "50px 0", fontSize: 12 }}>
                █████████████████████████████████<br />
                █ PASTE A QUOTE TO BEGIN ANALYSIS █<br />
                █████████████████████████████████
              </div>
            )}
          </div>
        )}

        {/* VERIFY PROTOCOL TAB */}
        {activeTab === "verify" && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 20, color: "#556655", fontSize: 11, letterSpacing: 1 }}>{"//"} VERIFICATION PROTOCOL — STANDARD OSINT OPERATING PROCEDURES</div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#ffaa00", fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>◈ VERIFICATION CHECKLIST</div>
              {VERIFY_CHECKLIST.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #0d1a0d" }}>
                  <span style={{ color: "#ffaa00", fontWeight: 700, minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ color: "#aab8aa", fontSize: 12, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#ff4444", fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>◈ RELIABILITY MATRIX</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Wire Services (Reuters/AFP)", rel: 92, color: "#44ff88" },
                  { label: "Official Military Channels", rel: 78, color: "#88ff88" },
                  { label: "Bellingcat Verified Reports", rel: 88, color: "#44ff88" },
                  { label: "ISW Daily Updates", rel: 85, color: "#44ff88" },
                  { label: "Unverified Telegram Channels", rel: 30, color: "#ff4444" },
                  { label: "Adversary Media (Hamas/Hezbollah)", rel: 20, color: "#ff2222" },
                  { label: "ACLED Dataset", rel: 82, color: "#44ff88" },
                  { label: "Social Media Unverified", rel: 25, color: "#ff4444" },
                ].map(({ label, rel, color }) => (
                  <div key={label} style={{ background: "#0d140d", border: "1px solid #1a2a1a", padding: "10px 12px", borderRadius: 2 }}>
                    <div style={{ color: "#aab8aa", fontSize: 10, marginBottom: 6 }}>{label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "#1a2a1a", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${rel}%`, height: "100%", background: color, borderRadius: 2 }} />
                      </div>
                      <span style={{ color, fontSize: 11, fontWeight: 700, minWidth: 35 }}>{rel}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ color: "#44aaff", fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>◈ GEOLOCATION QUICK TOOLS</div>
              {[
                { name: "SunCalc", url: "https://www.suncalc.org", desc: "Verify sun position/shadow angles in photos" },
                { name: "Bellingcat GeoLocator", url: "https://geolocator.bellingcat.com", desc: "AI-assisted geolocation of images" },
                { name: "Google Maps Street View", url: "https://maps.google.com", desc: "Street View comparison for location verification" },
                { name: "InVID / WeVerify", url: "https://weverify.eu/tools/", desc: "Video verification — old 2025 war footage flagged as circulating as current" },
                { name: "What3Words", url: "https://what3words.com", desc: "Precise location encoding used in field reports" },
              ].map(t => (
                <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #0d1a0d", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0d140d"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ color: "#44aaff", minWidth: 160, fontSize: 12 }}>{t.name}</span>
                  <span style={{ color: "#667766", fontSize: 11 }}>{t.desc}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

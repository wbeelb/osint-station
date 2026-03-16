import { useState, useEffect, useRef } from "react";

/* ───── Hebrew source descriptions ───── */
const DESC_HE = {
  osintwarfare: "מעקב סכסוכים בזמן אמת ברחבי העולם עם מפות וניתוח — ~95K עוקבים, פעיל 2026",
  intelsky: "תנועות צבאיות במזרח התיכון ביבשה, בים ובאוויר — מפעיל רדאר OSINT עצמאי ב-intelsky.org (~51K עוקבים)",
  aurora: "מעקב סכסוכים בזמן אמת, אירועים מאומתים ברחבי המזרח התיכון — פעיל 2026",
  mee: "חדשות אזוריות, לעיתים קרובות לפני המדיה המרכזית — נטייה פרו-פלסטינית, יש לאמת באופן עצמאי",
  idf: "הודעות רשמיות של צה״ל — אנגלית",
  idf_heb: "ערוץ צה״ל רשמי בעברית — בדרך כלל 15-30 דקות מהיר יותר מהפיד באנגלית",
  warmonitor: "מאגד מהיר ממספר ערוצי סכסוך — התייחס כאות גולמי, אמת לפני שימוש",
  iranwarlive: "מנוע OSINT אוטומטי — מפת תקיפות חיה, נפגעים מאומתים מ-Reuters/AP/CENTCOM בלבד. פעיל מרץ 2026.",
  gca: "89 מקורות (18 טלגרם + 63 RSS), מתעדכן כל 5 דקות, 400+ אירועי תקיפה מגואולוקטים, זיהוי מבוסס NLP.",
  bellingcat: "גיאולוקציה, אימות קוד פתוח, חקירות מעמיקות — סטנדרט הזהב. מעקב טומהוק איראן/עיראק פעיל מרץ 2026.",
  isw: "מפרסם עדכוני איראן פעמיים ביום (בוקר + ערב) נכון למרץ 2026 — התפוקה האנליטית הגבוהה ביותר בבנק זה.",
  ict: "מרכז OSINT אקדמי ישראלי לארגוני טרור — דוחות מעמיקים, קצב איטי יותר",
  acled: "מיפוי אירועי סכסוך עם מאגרי נתונים להורדה — הטוב ביותר לניתוח מגמות והשוואה היסטורית",
  liveuamap: "מיפוי סכסוכים חי — לשוניות לבנון, סוריה, איראן פעילות מרץ 2026, מתעדכן כל כמה דקות",
  alma: "מודיעין חיזבאללה / גבול לבנון, עמותה ישראלית, מפות טקטיות מפורטות מאוד",
  iranintl: "עיתון תפוצות פרסי — המקור החזק ביותר ל-IRGC, איראן הפנימית, מחאות וסנקציות. פעיל מרץ 2026.",
  almonitor: "ניתוח אזורי, כתבים עם מקורות טובים ברחבי המזרח התיכון — פעיל מרץ 2026",
  toi: "עיתונות ישראלית — מרכזית, חינם לקריאה, סיקור ביטחוני מהיר. מחליף את הארץ (הטיה שמאלנית קיצונית).",
  jpost: "עיתונות ישראלית — נטייה ימנית, מהיר בחדשות ביטחון פנים וצבא",
  ocha: "נתונים הומניטריים רשמיים של האו״ם, נתוני נפגעים, דוחות מצב לעזה — לשימוש כנתוני בסיס",
  aljazeera: "במימון מדינת קטאר — נטייה חזקה פרו-פלסטינית ופרו-איראנית, מגביר נרטיבים של ציר ההתנגדות. שימושי למעקב מסרי אויב; יש להפעיל מסנן עריכה כבד לפני ציטוט כמקור עובדתי.",
  reuters: "סוכנות ידיעות — האירועים המאושרים המהירים ביותר, סף האמינות הגבוה ביותר מכל מקור חדשותי",
  sentinel: "תמונות לוויין Copernicus חינמיות — מעולה להערכת נזק",
  firms: "זיהוי חתימות אש/חום — שימושי מאוד למעקב תקיפות אוויריות, ~3 שעות עיכוב",
  planet: "תמונות לוויין מסחריות יומיות (בתשלום) — רזולוציה הגבוהה ביותר",
  gee: "השוואת תמונות היסטוריות + עכשוויות, טוב לניתוח לפני/אחרי",
  ynet: "אתר חדשות ישראלי מוביל — סיקור מהיר של אירועי ביטחון, העורף הישראלי, ומצב פנים. פעיל 2026.",
  kan: "תאגיד השידור הישראלי — שידורי חדשות רשמיים, עדכוני חירום, ומידע מפקד העורף בזמן אמת",
  pikud: "התראות צבע אדום בזמן אמת — ירי רקטות, טילים, כלי טיס עוינים. קריטי למעקב התקפות על שטח ישראל",
};

/* ───── Hebrew type labels ───── */
const TYPE_HE = {
  Breaking: "שוטף", Official: "רשמי", Aggregator: "מאגד", Verification: "אימות",
  Analysis: "ניתוח", Data: "נתונים", Mapping: "מיפוי", News: "חדשות",
  Humanitarian: "הומניטרי", Wire: "סוכנות", Satellite: "לוויין",
};

/* ───── Reliability matrix data ───── */
const RELIABILITY_MATRIX = [
  { en: "Wire Services (Reuters/AFP)", he: "סוכנויות ידיעות (Reuters/AFP)", rel: 92, color: "#44ff88" },
  { en: "Official Military Channels", he: "ערוצים צבאיים רשמיים", rel: 78, color: "#88ff88" },
  { en: "Bellingcat Verified Reports", he: "דוחות Bellingcat מאומתים", rel: 88, color: "#44ff88" },
  { en: "ISW Daily Updates", he: "עדכונים יומיים של ISW", rel: 85, color: "#44ff88" },
  { en: "Unverified Telegram Channels", he: "ערוצי טלגרם לא מאומתים", rel: 30, color: "#ff4444" },
  { en: "Adversary Media (Hamas/Hezbollah)", he: "מדיה עוינת (חמאס/חיזבאללה)", rel: 20, color: "#ff2222" },
  { en: "ACLED Dataset", he: "מאגר נתוני ACLED", rel: 82, color: "#44ff88" },
  { en: "Social Media Unverified", he: "מדיה חברתית לא מאומתת", rel: 25, color: "#ff4444" },
];

/* ───── Geolocation tools data ───── */
const GEO_TOOLS = [
  { name: "SunCalc", url: "https://www.suncalc.org", en: "Verify sun position/shadow angles in photos", he: "אימות מיקום שמש/זוויות צללים בתמונות" },
  { name: "Bellingcat GeoLocator", url: "https://geolocator.bellingcat.com", en: "AI-assisted geolocation of images", he: "גיאולוקציה מבוססת AI של תמונות" },
  { name: "Google Maps Street View", url: "https://maps.google.com", en: "Street View comparison for location verification", he: "השוואת Street View לאימות מיקום" },
  { name: "InVID / WeVerify", url: "https://weverify.eu/tools/", en: "Video verification — old 2025 war footage flagged as circulating as current", he: "אימות וידאו — צילומי מלחמה ישנים מ-2025 מסומנים כמופצים כנוכחיים" },
  { name: "What3Words", url: "https://what3words.com", en: "Precise location encoding used in field reports", he: "קידוד מיקום מדויק בשימוש בדוחות שטח" },
];

/* ───── Sources ───── */
const SOURCES = {
  realtime: [
    { id: "osintwarfare", name: "OSINTWarfare", handle: "@OSINTWarfare", platform: "X", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Breaking", url: "https://x.com/OSINTWarfare", desc: "Real-time conflict tracking worldwide with maps and analysis — ~95K followers, active 2026" },
    { id: "intelsky", name: "IntelSky", handle: "@Intel_Sky", platform: "X/Web", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Breaking", url: "https://x.com/Intel_Sky", desc: "Middle East military movements on land, sea and air — operates own OSINT radar at intelsky.org (~51K followers)" },
    { id: "aurora", name: "Aurora Intel", handle: "@AuroraIntel", platform: "X", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Breaking", url: "https://x.com/AuroraIntel", desc: "Real-time conflict tracking, verified incidents across Middle East — active 2026" },
    { id: "mee", name: "Middle East Eye", handle: "@MiddleEastEye", platform: "X/Web", tier: 1, theater: ["Gaza", "Lebanon"], type: "News", url: "https://www.middleeasteye.net", desc: "Regional news, often ahead of mainstream media — pro-Palestinian lean, verify independently" },
    { id: "idf", name: "IDF Spokesperson", handle: "@IDF", platform: "X", tier: 1, theater: ["Gaza", "Lebanon"], type: "Official", url: "https://x.com/IDF", desc: "Official Israeli military announcements — English" },
    { id: "idf_heb", name: "IDF Hebrew", handle: "@IDFSpokesperson", platform: "Telegram", tier: 1, theater: ["Gaza", "Lebanon"], type: "Official", url: "https://t.me/idfofficial", desc: "Hebrew-language IDF official channel — typically 15-30 min faster than English feed" },
    { id: "warmonitor", name: "War Monitor", handle: "War Monitor", platform: "Telegram", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Aggregator", url: "https://t.me/warmonitor3", desc: "Fast-moving aggregator across multiple conflict feeds — treat as raw signal, verify before acting" },
    { id: "pikud", name: "Pikud HaOref", handle: "oref.org.il", platform: "Web/App", tier: 1, theater: ["Gaza", "Lebanon", "Iran"], type: "Official", url: "https://www.oref.org.il/en", desc: "Home Front Command real-time alerts — Red Alert for rockets, missiles, hostile aircraft over Israel. Critical for tracking attacks on Israeli territory." },
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
    { id: "ynet", name: "Ynet News", handle: "ynetnews.com", platform: "Web", tier: 3, theater: ["Gaza", "Lebanon", "Iran"], type: "News", url: "https://www.ynetnews.com", desc: "Major Israeli news site (English) — fast breaking security coverage, home front impact, domestic Israeli situation. Active 2026." },
    { id: "kan", name: "Kan News", handle: "kan.org.il", platform: "Web/TV", tier: 3, theater: ["Gaza", "Lebanon", "Iran"], type: "News", url: "https://www.kan.org.il/lobby/kan-english/", desc: "Israeli Public Broadcasting — official news, emergency broadcasts, Home Front Command updates in real-time" },
    { id: "aljazeera", name: "Al Jazeera", handle: "aljazeera.com", platform: "Web/X", tier: 3, theater: ["Gaza", "Lebanon", "Iran"], type: "News", url: "https://www.aljazeera.com/middle-east/", desc: "Qatari state-funded — strong pro-Palestinian and pro-Iran lean, amplifies Axis of Resistance narratives. Useful for tracking adversary messaging; apply heavy editorial filter before citing as factual source." },
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
const TIER_COLORS = { 1: "#ff4444", 2: "#ffaa00", 3: "#44aaff", 4: "#44ff88" };
const TYPE_COLORS = {
  Breaking: "#ff4444", Official: "#ff8800", Aggregator: "#ffcc00",
  Verification: "#44ff88", Analysis: "#44aaff", Data: "#aa88ff",
  Mapping: "#ff44aa", News: "#88ccff", Humanitarian: "#ff88aa",
  Wire: "#cccccc", Satellite: "#44ffcc",
};
const THEATERS = ["All", "Gaza", "Lebanon", "Iran"];

const SAMPLE_QUOTES = [
  { label: "Araghchi — Hormuz", label_he: "ארגצ'י — הורמוז", actor: "Iran FM Abbas Araghchi", actor_he: "שר החוץ האיראני עבאס ארגצ'י", text: `Iran's Foreign Minister Abbas Araghchi declared the strait is "open, but closed to our enemies, to those who carried out this cowardly aggression against us and to their allies."` },
  { label: "Khamenei — Resistance", label_he: "חמינאי — התנגדות", actor: "Supreme Leader Khamenei", actor_he: "המנהיג העליון חמינאי", text: "The Islamic Republic has never been the aggressor. We have only responded to Zionist crimes and American hegemony. Our missiles are a shield, not a sword." },
  { label: "Hamas — Ceasefire", label_he: "חמאס — הפסקת אש", actor: "Hamas Political Bureau", actor_he: "הלשכה הפוליטית של חמאס", text: "Hamas is committed to peace and the protection of civilians. Any civilian casualties are the direct result of Israeli aggression and occupation." },
  { label: "Hezbollah — Lebanon", label_he: "חיזבאללה — לבנון", actor: "Hezbollah Secretary-General", actor_he: "מזכ״ל חיזבאללה", text: "We are a Lebanese resistance movement defending our land. Our weapons are purely defensive and will never be turned against Lebanese citizens." },
];

/* ───── UI Translations ───── */
const T = {
  en: {
    live: "◉ LIVE", title: "OSINT STATION", subtitle: "// MIDDLE EAST THEATER",
    theaters_sub: "IRAN · LEBANON · GAZA · ACTIVE INTELLIGENCE SOURCES",
    sources_count: n => `${n} SOURCES`, verified: "VERIFIED", lang_toggle: "עברית",
    tab_sources: "SOURCE BANK", tab_ai: "AI ANALYST", tab_sanitize: "QUOTE SANITIZER", tab_verify: "VERIFY PROTOCOL",
    search_ph: "SEARCH SOURCES...", all: "ALL", compact: "COMPACT", expand: "EXPAND", total: "TOTAL",
    no_match: "NO SOURCES MATCH FILTER CRITERIA",
    tier_labels: { 1: "REAL-TIME", 2: "ANALYTICAL", 3: "PRIMARY", 4: "GEOSPATIAL" },
    theaters: { All: "ALL", Gaza: "GAZA", Lebanon: "LEBANON", Iran: "IRAN" },
    live_on: "◉ WEB SEARCH ON", live_off: "◎ WEB SEARCH OFF", disable: "DISABLE", enable: "ENABLE",
    live_on_desc: "// AI SEARCHES GOOGLE FOR REAL-TIME DATA BEFORE ANSWERING",
    live_off_desc: "// AI USES TRAINING KNOWLEDGE ONLY — NO INTERNET",
    ai_ph: "Enter intelligence query... (Enter to submit)",
    query: "QUERY ▶", scanning: "SCANNING...", analyst_resp: "// ANALYST RESPONSE", with_live: "WITH LIVE DATA",
    awaiting: ["██████████████████████████████", "█ AWAITING INTELLIGENCE QUERY █", "██████████████████████████████"],
    init: "Initializing analyst session...",
    activating: "Time-sensitive query — activating Google Search...",
    fetching: "Fetching: IranWarLive · Reuters · ToI · ISW...",
    search_done: "Google Search executed", synthesizing: "Synthesizing live results...", processing: "Processing response...",
    sample_qs: ["What happened in the last hour?", "Latest confirmed strikes on Iran?", "Current airspace status Middle East?", "Best sources for Hezbollah tunnels?", "How do I verify a Telegram strike claim?", "Compare ISW vs Bellingcat for Gaza"],
    sanitizer_badge: "◈ QUOTE SANITIZER — PROPAGANDA ANALYSIS ENGINE",
    sanitizer_desc: "Paste any official statement. The AI extracts the factual core · identifies propaganda elements · cross-references evidence · produces a corrected objective version.",
    sample_qs_label: "SAMPLE QUOTES:", actor_ph: "ACTOR / SOURCE...",
    actor_hint: `e.g. "Iran FM Abbas Araghchi" / "Hamas Political Bureau"`,
    quote_ph: "Paste official quote or statement here... (Ctrl+Enter to analyze)",
    sanitize: "SANITIZE ▶", analyzing: "ANALYZING...",
    cross_ref: "◉ CROSS-REFERENCING AGAINST DOCUMENTED EVIDENCE...",
    orig_core: "ORIGINAL CORE CLAIM", sanitized: "✓ SANITIZED OBJECTIVE VERSION",
    prop_el: n => `◈ PROPAGANDA ELEMENTS (${n})`, contras: n => `◈ CONTRADICTIONS VS EVIDENCE (${n})`,
    caution: "◈ USE WITH CAUTION", reliability: n => `RELIABILITY: ${n}/100`,
    claimed: "CLAIMED:", reality: "REALITY:",
    paste_q: ["█████████████████████████████████", "█ PASTE A QUOTE TO BEGIN ANALYSIS █", "█████████████████████████████████"],
    verify_sub: "// VERIFICATION PROTOCOL — STANDARD OSINT OPERATING PROCEDURES",
    checklist_title: "◈ VERIFICATION CHECKLIST", reliability_title: "◈ RELIABILITY MATRIX", geo_title: "◈ GEOLOCATION QUICK TOOLS",
    conf: c => `${c.toUpperCase()} CONFIDENCE`,
    lang_response: "",
  },
  he: {
    live: "◉ חי", title: "תחנת מודיעין", subtitle: "// תיאטרון המזרח התיכון",
    theaters_sub: "איראן · לבנון · עזה · מקורות מודיעין פעילים",
    sources_count: n => `${n} מקורות`, verified: "מאומת", lang_toggle: "English",
    tab_sources: "בנק מקורות", tab_ai: "אנליסט AI", tab_sanitize: "ניקוי ציטוטים", tab_verify: "פרוטוקול אימות",
    search_ph: "חיפוש מקורות...", all: "הכל", compact: "דחוס", expand: "הרחב", total: "סה״כ",
    no_match: "אין מקורות התואמים לסינון",
    tier_labels: { 1: "זמן אמת", 2: "אנליטי", 3: "ראשוני", 4: "גיאו-מרחבי" },
    theaters: { All: "הכל", Gaza: "עזה", Lebanon: "לבנון", Iran: "איראן" },
    live_on: "◉ חיפוש אינטרנט פעיל", live_off: "◎ חיפוש אינטרנט כבוי", disable: "כבה", enable: "הפעל",
    live_on_desc: "// ה-AI מחפש בגוגל מידע בזמן אמת לפני שעונה",
    live_off_desc: "// ה-AI משתמש בידע מובנה בלבד — ללא אינטרנט",
    ai_ph: "הכנס שאילתת מודיעין... (Enter לשליחה)",
    query: "שאילתה ▶", scanning: "סורק...", analyst_resp: "// תגובת אנליסט", with_live: "עם נתונים חיים",
    awaiting: ["████████████████████████████", "█   ממתין לשאילתת מודיעין   █", "████████████████████████████"],
    init: "מאתחל מסיית אנליסט...",
    activating: "שאילתה רגישת זמן — מפעיל חיפוש Google...",
    fetching: "שולף: IranWarLive · Reuters · ToI · ISW...",
    search_done: "חיפוש Google בוצע", synthesizing: "מסנתז תוצאות חיות...", processing: "מעבד תגובה...",
    sample_qs: ["מה קרה בשעה האחרונה?", "תקיפות מאושרות אחרונות על איראן?", "מצב מרחב האוויר הנוכחי במזרח התיכון?", "מקורות מומלצים למנהרות חיזבאללה?", "כיצד מאמתים דיווח תקיפה מטלגרם?", "השווה ISW מול Bellingcat לגזה"],
    sanitizer_badge: "◈ ניקוי ציטוטים — מנוע ניתוח תעמולה",
    sanitizer_desc: "הדבק הצהרה רשמית. ה-AI מחלץ את הגרעין העובדתי · מזהה אלמנטי תעמולה · מצליב ראיות · מייצר גרסה מתוקנת ואובייקטיבית.",
    sample_qs_label: "ציטוטים לדוגמה:", actor_ph: "גורם / מקור...",
    actor_hint: `לדוגמה: "שר החוץ ארגצ'י" / "הלשכה הפוליטית של חמאס"`,
    quote_ph: "הדבק ציטוט או הצהרה רשמית כאן... (Ctrl+Enter לניתוח)",
    sanitize: "נתח ▶", analyzing: "מנתח...",
    cross_ref: "◉ מצליב מול ראיות מתועדות...",
    orig_core: "טענת הליבה המקורית", sanitized: "✓ גרסה אובייקטיבית מנוקה",
    prop_el: n => `◈ אלמנטי תעמולה (${n})`, contras: n => `◈ סתירות מול ראיות (${n})`,
    caution: "◈ יש להשתמש בזהירות", reliability: n => `אמינות: ${n}/100`,
    claimed: "נטען:", reality: "מציאות:",
    paste_q: ["████████████████████████████████", "█   הדבק ציטוט להתחלת ניתוח   █", "████████████████████████████████"],
    verify_sub: "// פרוטוקול אימות — נהלי OSINT סטנדרטיים",
    checklist_title: "◈ רשימת תיוג לאימות", reliability_title: "◈ מטריצת אמינות", geo_title: "◈ כלי גיאולוקציה מהירים",
    conf: c => { const m = { high: "גבוה", medium: "בינוני", low: "נמוך" }; return `ביטחון ${m[c] || c}`; },
    lang_response: "\n\nחשוב מאוד: ענה בעברית בלבד. כל התשובה חייבת להיות בעברית.",
  },
};

const VERIFY_CHECKLIST = {
  en: [
    "Cross-reference with ≥3 independent sources",
    "Check video metadata (sun angle, shadows) for geolocation",
    "Use Bellingcat geolocation tools for footage verification",
    "Telegram channels carry significant disinfo — treat as raw signal",
    "Adversary channels (Hamas/Hezbollah) require heavy propaganda filter",
    "Official channels may lag real events by 15–60 minutes",
    "Satellite imagery has 1–3 day delay for commercial providers",
    "Old footage from June 2025 conflict confirmed circulating as current — use InVID/WeVerify",
  ],
  he: [
    "צלב-הפנה עם ≥3 מקורות עצמאיים",
    "בדוק מטא-נתוני וידאו (זווית שמש, צללים) לגיאולוקציה",
    "השתמש בכלי גיאולוקציה של Bellingcat לאימות צילומים",
    "ערוצי טלגרם נושאים מידע שגוי משמעותי — התייחס כאות גולמי",
    "ערוצי אויב (חמאס/חיזבאללה) דורשים מסנן תעמולה כבד",
    "ערוצים רשמיים עשויים לפגר אחרי אירועים ב-15–60 דקות",
    "לתמונות לוויין מספקים מסחריים יש עיכוב של 1–3 ימים",
    "צילומים ישנים מיוני 2025 מאושרים כמופצים כנוכחיים — השתמש ב-InVID/WeVerify",
  ],
};

/* ───── Components ───── */

function SourceCard({ source, compact, lang, FM }) {
  const desc = lang === "he" ? (DESC_HE[source.id] || source.desc) : source.desc;
  const typeLabel = lang === "he" ? (TYPE_HE[source.type] || source.type).toUpperCase() : source.type.toUpperCase();

  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer"
      style={{
        display: "block", background: "rgba(255,255,255,0.03)",
        border: `1px solid ${TIER_COLORS[source.tier]}33`,
        borderLeft: `3px solid ${TIER_COLORS[source.tier]}`,
        borderRadius: 2, padding: compact ? "10px 14px" : "14px 18px",
        marginBottom: 6, textDecoration: "none", transition: "background 0.15s", cursor: "pointer",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 3 : 5, flexWrap: "wrap" }}>
        <span style={{ color: TIER_COLORS[source.tier], fontFamily: "monospace", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>T{source.tier}</span>
        <span style={{ color: "#e8dcc8", fontFamily: FM, fontSize: 15, fontWeight: 700 }}>{source.name}</span>
        <span style={{ background: `${TYPE_COLORS[source.type]}22`, color: TYPE_COLORS[source.type], border: `1px solid ${TYPE_COLORS[source.type]}55`, borderRadius: 2, padding: "1px 6px", fontSize: 11, fontFamily: FM, letterSpacing: 1, marginLeft: "auto" }}>{typeLabel}</span>
      </div>
      <div style={{ color: "#888", fontFamily: "monospace", fontSize: 12, marginBottom: compact ? 0 : 5 }}>{source.handle} · {source.platform}</div>
      {!compact && <div style={{ color: "#bbc8a8", fontFamily: FM, fontSize: 14, lineHeight: 1.75 }}>{desc}</div>}
      {!compact && (
        <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
          {source.theater.map(t => (
            <span key={t} style={{ background: "#ffffff0a", color: "#888", border: "1px solid #ffffff15", borderRadius: 2, padding: "1px 6px", fontSize: 11, fontFamily: "monospace" }}>{t.toUpperCase()}</span>
          ))}
        </div>
      )}
    </a>
  );
}

export default function OsintDashboard() {
  const [lang, setLang] = useState("en");
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

  const tx = T[lang];
  const isRTL = lang === "he";
  const FM = isRTL ? "'Heebo', sans-serif" : "'Courier New', monospace";

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { setAiQuery(""); setAiResponse(""); }, [lang]);

  const filteredSources = ALL_SOURCES.filter(s => {
    const theaterMatch = activeTheater === "All" || s.theater.includes(activeTheater);
    const tierMatch = activeTier === "All" || s.tier === parseInt(activeTier);
    const desc = lang === "he" ? (DESC_HE[s.id] || s.desc) : s.desc;
    const searchMatch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase());
    return theaterMatch && tierMatch && searchMatch;
  });

  const handleAiQuery = async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResponse("");
    setFetchSteps([tx.init]);

    const sourceList = ALL_SOURCES.map(s =>
      `[T${s.tier}] ${s.name} (${s.type}) — ${s.theater.join("/")} — ${s.desc}`
    ).join("\n");

    const now = new Date().toUTCString();
    const isTimeSensitive = /last hour|latest|now|current|today|right now|breaking|live|update|happened|strike|attack|news|שעה|עכשיו|עדכון|אחרון|היום|פגיעה|תקיפה|חדשות/i.test(aiQuery);

    const systemPrompt = `You are a professional OSINT analyst specializing in the Middle East conflict — covering Israel, Iran, Lebanon, Gaza, and the Axis of Resistance network. Current date/time: ${now}.

CRITICAL: Always include the Israeli perspective and home front impact. Cover rocket/missile attacks ON Israel, IDF operations, Israeli casualties, evacuations, Home Front Command alerts, and the domestic Israeli situation. Israel is a primary subject — not just a background actor.

CURATED SOURCE BANK:
${sourceList}

${liveMode
      ? `OPERATING MODE: LIVE FETCH ENABLED.
You have Google Search available. Rules:
1. For ANY time-sensitive query (latest, last hour, now, current, today, recent strikes/attacks/news) — ALWAYS search BEFORE answering.
2. Report ACTUAL FINDINGS first — what happened, when, where, which source, verified/unverified.
3. Label clearly: [LIVE] for search results vs [KB] for knowledge base info.
4. If search returns nothing useful, say so and explain.
5. For non-time-sensitive queries skip search.`
      : `OPERATING MODE: KNOWLEDGE BASE ONLY. No web search. Explicitly state you cannot verify real-time events.`}

Style: tactical brevity, structured headers, cite source IDs, flag unverified claims.${tx.lang_response}`;

    try {
      if (liveMode && isTimeSensitive) {
        setFetchSteps(prev => [...prev, tx.activating, tx.fetching]);
      }

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-secret": import.meta.env.VITE_API_SECRET },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: "user", content: aiQuery }],
          liveSearch: liveMode,
        })
      });

      const data = await res.json();
      if (data.error) { setAiResponse(`API ERROR: ${data.error.message || JSON.stringify(data.error)}`); return; }

      if (data.searchUsed) {
        setFetchSteps(prev => [...prev, tx.search_done, tx.synthesizing]);
      } else {
        setFetchSteps(prev => [...prev, tx.processing]);
      }

      setAiResponse(data.text || "No response received.");
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
3. CROSS-REFERENCE against verifiable facts using Google Search
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
}${tx.lang_response}`;

    try {
      const userMsg = `ACTOR: ${quoteActor || "Unknown"}\n\nQUOTE TO SANITIZE:\n"${quoteInput}"\n\nUse Google Search to verify factual claims before completing analysis.`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-secret": import.meta.env.VITE_API_SECRET },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: "user", content: userMsg }],
          liveSearch: true,
        })
      });

      const data = await res.json();
      if (data.error) { setQuoteResult({ error: data.error.message || JSON.stringify(data.error) }); return; }

      const text = data.text || "";
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
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#0a0c09", color: "#c8d4b8", fontFamily: FM, position: "relative", overflow: "hidden" }}>
      <div style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)", pointerEvents: "none", position: "fixed", inset: 0, zIndex: 9999 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at 20% 20%, #0d1a0a 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #0a0d14 0%, transparent 60%)" }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700&display=swap');
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
                <span style={{ color: "#44ff88", fontSize: 12, letterSpacing: 3, animation: "pulse 2s infinite" }}>{tx.live}</span>
                <span style={{ color: "#e8dcc8", fontSize: 22, fontWeight: 700, letterSpacing: isRTL ? 0 : 2 }}>{tx.title}</span>
                <span style={{ color: "#555", fontSize: 14 }}>{tx.subtitle}</span>
              </div>
              <div style={{ color: "#445544", fontSize: 12, letterSpacing: isRTL ? 0 : 2, marginTop: 2 }}>{tx.theaters_sub}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setLang(lang === "en" ? "he" : "en")} style={{
                background: "#0d140d", border: "1px solid #2a5a2a", color: "#44ff88",
                padding: "5px 14px", cursor: "pointer", fontFamily: FM, fontSize: 13, borderRadius: 2,
              }}>{tx.lang_toggle}</button>
              <div style={{ textAlign: isRTL ? "left" : "right" }}>
                <div dir="ltr" style={{ color: "#44ff88", fontSize: 14, fontFamily: "monospace", letterSpacing: 2 }}>{time.toUTCString().replace("GMT", "UTC")}</div>
                <div style={{ color: "#445544", fontSize: 11, marginTop: 2, fontFamily: FM }}>{tx.sources_count(ALL_SOURCES.length)} · {tx.verified} {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid #1a2a1a", flexWrap: "wrap" }}>
          {[["sources", tx.tab_sources, "#44ff88"], ["ai", tx.tab_ai, "#44ff88"], ["sanitize", tx.tab_sanitize, "#ffaa00"], ["verify", tx.tab_verify, "#44ff88"]].map(([tab, label, color]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? "#1a2a1a" : "transparent",
              color: activeTab === tab ? color : "#556655",
              border: "none", borderBottom: activeTab === tab ? `2px solid ${color}` : "2px solid transparent",
              padding: "9px 20px", cursor: "pointer", fontFamily: FM, fontSize: 13, letterSpacing: isRTL ? 0 : 2, transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        {/* SOURCES TAB */}
        {activeTab === "sources" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={tx.search_ph}
                style={{ background: "#0d140d", border: "1px solid #2a3a2a", color: "#c8d4b8", padding: "8px 14px", fontFamily: FM, fontSize: 13, letterSpacing: isRTL ? 0 : 1, borderRadius: 2, width: 220 }} />
              <div style={{ display: "flex", gap: 4 }}>
                {THEATERS.map(t => (
                  <button key={t} onClick={() => setActiveTheater(t)} style={{
                    background: activeTheater === t ? "#1a3a1a" : "transparent", color: activeTheater === t ? "#88ff88" : "#556655",
                    border: `1px solid ${activeTheater === t ? "#2a5a2a" : "#1a2a1a"}`, padding: "7px 14px", cursor: "pointer", fontFamily: FM, fontSize: 12, letterSpacing: isRTL ? 0 : 1, borderRadius: 2,
                  }}>{tx.theaters[t]}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["All", "1", "2", "3", "4"].map(t => (
                  <button key={t} onClick={() => setActiveTier(t)} style={{
                    background: activeTier === t ? "#1a2a2a" : "transparent",
                    color: activeTier === t ? (t === "All" ? "#88ff88" : TIER_COLORS[parseInt(t)]) : "#445544",
                    border: `1px solid ${activeTier === t ? "#2a4a4a" : "#1a2a1a"}`, padding: "7px 12px", cursor: "pointer", fontFamily: FM, fontSize: 12, borderRadius: 2,
                  }}>{t === "All" ? tx.all : `T${t}`}</button>
                ))}
              </div>
              <button onClick={() => setCompact(!compact)} style={{ marginLeft: "auto", background: "transparent", color: "#445544", border: "1px solid #1a2a1a", padding: "7px 14px", cursor: "pointer", fontFamily: FM, fontSize: 12, borderRadius: 2 }}>
                {compact ? tx.expand : tx.compact}
              </button>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 16, padding: "9px 14px", background: "#0d140d", border: "1px solid #1a2a1a", borderRadius: 2 }}>
              {[1, 2, 3, 4].map(t => {
                const count = filteredSources.filter(s => s.tier === t).length;
                return (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: TIER_COLORS[t], fontSize: 11, letterSpacing: isRTL ? 0 : 1, fontFamily: FM }}>T{t} {tx.tier_labels[t]}</span>
                    <span style={{ color: TIER_COLORS[t], fontWeight: 700 }}>{count}</span>
                  </div>
                );
              })}
              <span style={{ marginLeft: "auto", color: "#445544", fontSize: 12 }}>{tx.total}: {filteredSources.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 8 }}>
              {filteredSources.length === 0
                ? <div style={{ color: "#445544", gridColumn: "1/-1", textAlign: "center", padding: 40, fontSize: 14 }}>{tx.no_match}</div>
                : filteredSources.map(s => <SourceCard key={s.id} source={s} compact={compact} lang={lang} FM={FM} />)
              }
            </div>
          </>
        )}

        {/* AI ANALYST TAB */}
        {activeTab === "ai" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "9px 16px", background: "#0a120a", border: "1px solid #1a2a1a", borderRadius: 2, flexWrap: "wrap" }}>
              <span style={{ color: liveMode ? "#44ff88" : "#445544", fontSize: 12, letterSpacing: isRTL ? 0 : 2, animation: liveMode ? "pulse 1.5s infinite" : "none" }}>
                {liveMode ? tx.live_on : tx.live_off}
              </span>
              <button onClick={() => setLiveMode(v => !v)} style={{
                background: liveMode ? "#0d2a0d" : "#1a1a1a", border: `1px solid ${liveMode ? "#2a5a2a" : "#333"}`,
                color: liveMode ? "#44ff88" : "#556655", padding: "5px 14px", cursor: "pointer", fontFamily: FM, fontSize: 12, borderRadius: 2,
              }}>{liveMode ? tx.disable : tx.enable}</button>
              <span style={{ color: "#334433", fontSize: 12 }}>{liveMode ? tx.live_on_desc : tx.live_off_desc}</span>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {tx.sample_qs.map(q => (
                <button key={q} onClick={() => { setAiQuery(q); setTimeout(() => aiInputRef.current?.focus(), 50); }} style={{
                  background: "#0d140d", border: "1px solid #1a3a1a", color: "#778877",
                  padding: "7px 13px", cursor: "pointer", fontFamily: FM, fontSize: 13, borderRadius: 2,
                }}
                  onMouseEnter={e => { e.target.style.color = "#88cc88"; e.target.style.borderColor = "#2a5a2a"; }}
                  onMouseLeave={e => { e.target.style.color = "#778877"; e.target.style.borderColor = "#1a3a1a"; }}
                >{q}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <textarea ref={aiInputRef} value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiQuery(); } }}
                placeholder={tx.ai_ph} rows={3}
                style={{ flex: 1, background: "#0d140d", border: "1px solid #2a3a2a", color: "#c8d4b8", padding: "14px 18px", fontFamily: FM, fontSize: 15, lineHeight: 1.7, borderRadius: 2, resize: "vertical" }}
              />
              <button onClick={handleAiQuery} disabled={aiLoading || !aiQuery.trim()} style={{
                background: aiLoading ? "#0d1a0d" : "#0d2a0d", border: `1px solid ${aiLoading ? "#1a3a1a" : "#2a5a2a"}`,
                color: aiLoading ? "#2a5a2a" : "#44ff88", padding: "0 22px", cursor: aiLoading ? "wait" : "pointer",
                fontFamily: FM, fontSize: 13, letterSpacing: isRTL ? 0 : 2, borderRadius: 2, minWidth: 110,
              }}>{aiLoading ? tx.scanning : tx.query}</button>
            </div>

            {aiLoading && fetchSteps.length > 0 && (
              <div style={{ background: "#0a120a", border: "1px solid #1a2a1a", borderRadius: 2, padding: "12px 16px", marginBottom: 12 }}>
                {fetchSteps.map((step, i) => (
                  <div key={i} style={{ color: i === fetchSteps.length - 1 ? "#44ff88" : "#2a4a2a", fontFamily: FM, fontSize: 12, lineHeight: 2, letterSpacing: isRTL ? 0 : 1 }}>
                    {i === fetchSteps.length - 1 ? "▶ " : "✓ "}{step}
                  </div>
                ))}
              </div>
            )}

            {aiResponse && (
              <div style={{ background: "#0d140d", border: "1px solid #1a3a1a", borderLeft: isRTL ? "none" : "3px solid #44ff88", borderRight: isRTL ? "3px solid #44ff88" : "none", padding: "18px 22px", borderRadius: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ color: "#445544", fontSize: 12, letterSpacing: isRTL ? 0 : 2 }}>{tx.analyst_resp}</span>
                  {liveMode && <span style={{ color: "#44ff88", fontSize: 11, border: "1px solid #1a4a1a", padding: "2px 8px", borderRadius: 2 }}>{tx.with_live}</span>}
                  <span dir="ltr" style={{ color: "#334433", fontSize: 11, marginLeft: "auto" }}>{new Date().toUTCString().replace("GMT", "UTC")}</span>
                </div>
                <div style={{ color: "#d4e0c4", fontSize: 15, lineHeight: 2.0, whiteSpace: "pre-wrap", letterSpacing: 0.1 }}>{aiResponse}</div>
              </div>
            )}

            {!aiResponse && !aiLoading && (
              <div style={{ color: "#2a3a2a", textAlign: "center", padding: "60px 0", fontSize: 13, fontFamily: "monospace" }}>
                {tx.awaiting.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
          </div>
        )}

        {/* QUOTE SANITIZER TAB */}
        {activeTab === "sanitize" && (
          <div>
            <div style={{ marginBottom: 14, padding: "10px 16px", background: "#120a00", border: "1px solid #2a1a00", borderLeft: isRTL ? "none" : "3px solid #ffaa00", borderRight: isRTL ? "3px solid #ffaa00" : "none", borderRadius: 2 }}>
              <div style={{ color: "#ffaa00", fontSize: 12, letterSpacing: isRTL ? 0 : 2, marginBottom: 4 }}>{tx.sanitizer_badge}</div>
              <div style={{ color: "#998855", fontSize: 14, lineHeight: 1.7 }}>{tx.sanitizer_desc}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#556655", fontSize: 12, letterSpacing: isRTL ? 0 : 1, marginBottom: 6 }}>{tx.sample_qs_label}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SAMPLE_QUOTES.map(sq => (
                  <button key={sq.label} onClick={() => { setQuoteInput(sq.text); setQuoteActor(lang === "he" ? sq.actor_he : sq.actor); }} style={{
                    background: "#120a00", border: "1px solid #2a1a00", color: "#886644",
                    padding: "6px 12px", cursor: "pointer", fontFamily: FM, fontSize: 12, borderRadius: 2,
                  }}
                    onMouseEnter={e => { e.target.style.color = "#ffaa00"; e.target.style.borderColor = "#4a2a00"; }}
                    onMouseLeave={e => { e.target.style.color = "#886644"; e.target.style.borderColor = "#2a1a00"; }}
                  >{lang === "he" ? sq.label_he : sq.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 8, marginBottom: 8 }}>
              <input value={quoteActor} onChange={e => setQuoteActor(e.target.value)} placeholder={tx.actor_ph}
                style={{ background: "#0d0a00", border: "1px solid #2a1a00", color: "#c8b488", padding: "11px 16px", fontFamily: FM, fontSize: 13, borderRadius: 2 }} />
              <div style={{ color: "#334433", fontSize: 12, alignSelf: "center", paddingLeft: 4 }}>{tx.actor_hint}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <textarea value={quoteInput} onChange={e => setQuoteInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSanitize(); }}
                placeholder={tx.quote_ph} rows={4}
                style={{ flex: 1, background: "#0d0a00", border: "1px solid #2a1a00", color: "#c8b488", padding: "14px 18px", fontFamily: FM, fontSize: 14, lineHeight: 1.7, borderRadius: 2, resize: "vertical" }}
              />
              <button onClick={handleSanitize} disabled={quoteLoading || !quoteInput.trim()} style={{
                background: quoteLoading ? "#120a00" : "#1a0d00", border: `1px solid ${quoteLoading ? "#2a1a00" : "#4a2a00"}`,
                color: quoteLoading ? "#4a2a00" : "#ffaa00", padding: "0 22px", cursor: quoteLoading ? "wait" : "pointer",
                fontFamily: FM, fontSize: 13, letterSpacing: isRTL ? 0 : 2, borderRadius: 2, minWidth: 120,
              }}>{quoteLoading ? tx.analyzing : tx.sanitize}</button>
            </div>

            {quoteLoading && (
              <div style={{ background: "#120a00", border: "1px solid #2a1a00", borderRadius: 2, padding: "18px 22px", textAlign: "center" }}>
                <div style={{ color: "#ffaa00", fontSize: 12, letterSpacing: isRTL ? 0 : 2, animation: "pulse 1s infinite" }}>{tx.cross_ref}</div>
              </div>
            )}

            {quoteResult && !quoteLoading && (
              <div>
                {quoteResult.error && <div style={{ background: "#1a0a0a", border: "1px solid #4a1a1a", borderRadius: 2, padding: 16, color: "#ff6666", fontSize: 14 }}>ERROR: {quoteResult.error}</div>}
                {quoteResult.raw && <div style={{ background: "#120a00", border: "1px solid #2a1a00", borderLeft: isRTL ? "none" : "3px solid #ffaa00", borderRight: isRTL ? "3px solid #ffaa00" : "none", padding: 16, borderRadius: 2, color: "#c8b488", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{quoteResult.raw}</div>}
                {quoteResult.sanitized_version && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", background: "#120a00", border: "1px solid #2a1a00", borderRadius: 2 }}>
                      <span style={{ color: "#ffaa00", fontSize: 13, fontWeight: 700 }}>{quoteResult.actor}</span>
                      <span style={{ marginLeft: "auto", color: quoteResult.reliability_score > 60 ? "#44aaff" : quoteResult.reliability_score > 30 ? "#ffaa00" : "#ff4444", fontSize: 13, fontWeight: 700, border: "1px solid currentColor", padding: "2px 10px", borderRadius: 2 }}>
                        {tx.reliability(quoteResult.reliability_score)}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#0d0a00", border: "1px solid #2a1a0055", borderLeft: isRTL ? "none" : "3px solid #ff4444", borderRight: isRTL ? "3px solid #ff4444" : "none", padding: "14px 18px", borderRadius: 2 }}>
                        <div style={{ color: "#ff4444", fontSize: 11, letterSpacing: isRTL ? 0 : 2, marginBottom: 8 }}>{tx.orig_core}</div>
                        <div style={{ color: "#d4b898", fontSize: 14, lineHeight: 1.8 }}>{quoteResult.original_core_claim}</div>
                      </div>
                      <div style={{ background: "#0a0d0a", border: "1px solid #1a3a1a", borderLeft: isRTL ? "none" : "3px solid #44ff88", borderRight: isRTL ? "3px solid #44ff88" : "none", padding: "14px 18px", borderRadius: 2 }}>
                        <div style={{ color: "#44ff88", fontSize: 11, letterSpacing: isRTL ? 0 : 2, marginBottom: 8 }}>{tx.sanitized}</div>
                        <div style={{ color: "#d4e0c4", fontSize: 14, lineHeight: 1.8 }}>{quoteResult.sanitized_version}</div>
                      </div>
                    </div>
                    {quoteResult.propaganda_elements?.length > 0 && (
                      <div style={{ background: "#0d0a00", border: "1px solid #2a1a00", borderRadius: 2, padding: "14px 18px" }}>
                        <div style={{ color: "#ffaa00", fontSize: 11, letterSpacing: isRTL ? 0 : 2, marginBottom: 10 }}>{tx.prop_el(quoteResult.propaganda_elements.length)}</div>
                        {quoteResult.propaganda_elements.map((el, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid #1a1000", alignItems: "flex-start" }}>
                            <span style={{ background: `${PROP_TYPE_COLOR[el.type] || "#888"}22`, color: PROP_TYPE_COLOR[el.type] || "#888", border: `1px solid ${PROP_TYPE_COLOR[el.type] || "#888"}44`, borderRadius: 2, padding: "2px 8px", fontSize: 11, whiteSpace: "nowrap", marginTop: 2 }}>
                              {(el.type || "").replace(/_/g, " ").toUpperCase()}
                            </span>
                            <div>
                              <div style={{ color: "#d4b888", fontSize: 13, fontStyle: "italic", marginBottom: 3 }}>"{el.element}"</div>
                              <div style={{ color: "#998855", fontSize: 13, lineHeight: 1.65 }}>{el.explanation}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {quoteResult.contradictions?.length > 0 && (
                      <div style={{ background: "#0d0a0a", border: "1px solid #3a1a1a", borderRadius: 2, padding: "14px 18px" }}>
                        <div style={{ color: "#ff4444", fontSize: 11, letterSpacing: isRTL ? 0 : 2, marginBottom: 10 }}>{tx.contras(quoteResult.contradictions.length)}</div>
                        {quoteResult.contradictions.map((c, i) => (
                          <div key={i} style={{ padding: "9px 0", borderBottom: "1px solid #1a0a0a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ color: "#ff6666", fontSize: 12 }}>{tx.claimed}</span>
                              <span style={{ color: "#d4b898", fontSize: 13 }}>{c.claim}</span>
                              <span style={{ marginLeft: "auto", color: CONFIDENCE_COLOR[c.confidence] || "#888", fontSize: 11, border: `1px solid ${CONFIDENCE_COLOR[c.confidence] || "#888"}44`, padding: "2px 8px", borderRadius: 2 }}>
                                {tx.conf(c.confidence || "")}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <span style={{ color: "#44ff88", fontSize: 12, minWidth: 70 }}>{tx.reality}</span>
                              <span style={{ color: "#b8c8b0", fontSize: 13, lineHeight: 1.65 }}>{c.reality}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {quoteResult.use_with_caution?.length > 0 && (
                      <div style={{ background: "#0a0a0d", border: "1px solid #1a1a3a", borderRadius: 2, padding: "12px 16px" }}>
                        <div style={{ color: "#44aaff", fontSize: 11, letterSpacing: isRTL ? 0 : 2, marginBottom: 8 }}>{tx.caution}</div>
                        {quoteResult.use_with_caution.map((w, i) => (
                          <div key={i} style={{ color: "#7788aa", fontSize: 13, lineHeight: 1.8 }}>⚠ {w}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!quoteResult && !quoteLoading && (
              <div style={{ color: "#2a2000", textAlign: "center", padding: "50px 0", fontSize: 13, fontFamily: "monospace" }}>
                {tx.paste_q.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
          </div>
        )}

        {/* VERIFY PROTOCOL TAB */}
        {activeTab === "verify" && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 20, color: "#556655", fontSize: 13, letterSpacing: isRTL ? 0 : 1 }}>{tx.verify_sub}</div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#ffaa00", fontSize: 13, letterSpacing: isRTL ? 0 : 2, marginBottom: 10 }}>{tx.checklist_title}</div>
              {VERIFY_CHECKLIST[lang].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid #0d1a0d" }}>
                  <span style={{ color: "#ffaa00", fontWeight: 700, minWidth: 24, fontFamily: "monospace" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ color: "#b8c8aa", fontSize: 14, lineHeight: 1.7 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#ff4444", fontSize: 13, letterSpacing: isRTL ? 0 : 2, marginBottom: 10 }}>{tx.reliability_title}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {RELIABILITY_MATRIX.map(({ en, he, rel, color }) => (
                  <div key={en} style={{ background: "#0d140d", border: "1px solid #1a2a1a", padding: "11px 14px", borderRadius: 2 }}>
                    <div style={{ color: "#aab8aa", fontSize: 12, marginBottom: 6 }}>{lang === "he" ? he : en}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "#1a2a1a", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${rel}%`, height: "100%", background: color, borderRadius: 2 }} />
                      </div>
                      <span style={{ color, fontSize: 13, fontWeight: 700, minWidth: 38, fontFamily: "monospace" }}>{rel}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ color: "#44aaff", fontSize: 13, letterSpacing: isRTL ? 0 : 2, marginBottom: 10 }}>{tx.geo_title}</div>
              {GEO_TOOLS.map(tool => (
                <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid #0d1a0d", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0d140d"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span dir="ltr" style={{ color: "#55bbff", minWidth: 170, fontSize: 14, fontFamily: "monospace" }}>{tool.name}</span>
                  <span style={{ color: "#7a8870", fontSize: 13 }}>{lang === "he" ? tool.he : tool.en}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

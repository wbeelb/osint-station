export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = req.headers["x-api-secret"];
  if (process.env.API_SECRET && secret !== process.env.API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { system, messages, liveSearch } = req.body;
    const userText = messages?.[0]?.content || "";

    const body = {
      contents: [{ role: "user", parts: [{ text: userText }] }],
      systemInstruction: { parts: [{ text: system }] },
      generationConfig: { maxOutputTokens: 2000 },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_ONLY_HIGH" },
      ],
      ...(liveSearch && { tools: [{ google_search: {} }] }),
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    const candidate = data.candidates?.[0];
    const finishReason = candidate?.finishReason;

    if (finishReason === "SAFETY") {
      const blocked = (candidate?.safetyRatings || [])
        .filter(r => r.blocked)
        .map(r => r.category)
        .join(", ");
      return res.status(200).json({
        text: `Response blocked by safety filter (${blocked || "unknown category"}). Try rephrasing with more neutral language.`,
        searchUsed: false,
      });
    }

    const parts = candidate?.content?.parts || [];
    const text = parts.map(p => p.text || "").join("");
    const searchUsed = !!(candidate?.groundingMetadata?.webSearchQueries?.length);

    if (!text) {
      return res.status(200).json({
        text: `No response generated. Finish reason: ${finishReason || "unknown"}. Try rephrasing your query.`,
        searchUsed: false,
      });
    }

    res.status(200).json({ text, searchUsed });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
}

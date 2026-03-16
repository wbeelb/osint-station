export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { system, messages, max_tokens, liveSearch } = req.body;
    const userText = messages?.[0]?.content || "";

    const body = {
      contents: [{ role: "user", parts: [{ text: userText }] }],
      systemInstruction: { parts: [{ text: system }] },
      generationConfig: { maxOutputTokens: max_tokens || 1500 },
      ...(liveSearch && { tools: [{ google_search: {} }] }),
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || "").join("") || "No response received.";
    const searchUsed = !!(data.candidates?.[0]?.groundingMetadata?.webSearchQueries?.length);

    res.status(200).json({ text, searchUsed });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
}

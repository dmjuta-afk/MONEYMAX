// MONEYMAX chat API - no database. Uses ANTHROPIC_API_KEY only.
const PLAN_MODEL = {
  free: "claude-haiku-4-5-20251001",
  plus: "claude-sonnet-4-6",
};

const SYSTEM_PROMPT =
  "You are MONEYMAX, a warm, sharp personal financial counselor. Give practical, specific, encouraging guidance on budgeting, saving, debt payoff, and investing. Use simple language and concrete numbers. Currency is South African Rand (R) unless the user uses another. Keep answers focused and useful, usually under 250 words. Always close with a brief reminder: this is educational information, not licensed financial advice.";

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return json({ error: "AI service not configured." }, 500);

    const body = await request.json();
    const message = (body.message || "").trim();
    const plan = body.plan === "plus" ? "plus" : "free";
    if (!message) return json({ error: "Empty message." }, 400);

    const model = PLAN_MODEL[plan];
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await aiRes.json();
    if (!aiRes.ok) {
      const m = data && data.error ? data.error.message : "AI request failed.";
      return json({ error: m }, 502);
    }
    const reply = data.content && data.content[0] && data.content[0].text
      ? data.content[0].text
      : "I couldn't generate a response. Please try again.";
    return json({ reply }, 200);
  } catch (e) {
    return json({ error: e.message || "Server error." }, 500);
  }
}

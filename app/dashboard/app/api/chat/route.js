import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    var body = await request.json();
    var userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    var apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: "You are MONEYMAX, a warm and knowledgeable AI financial counselor. Provide helpful, practical financial guidance on budgeting, saving, debt management, and investing. Always include a disclaimer: This is educational information, not financial advice. Consult qualified professionals for personalized guidance.",
        messages: [
          { role: "user", content: userMessage }
        ]
      })
    });

    var data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "API error" }, { status: response.status });
    }

    var reply = data.content && data.content[0] ? data.content[0].text : "No response";

    return NextResponse.json({ reply: reply });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

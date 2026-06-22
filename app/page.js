"use client";

import { useState, useEffect, useRef } from "react";

/* ============================================================
   PAYMENTS: when your Paystack payment page is ready, paste its
   URL between the quotes below. The Pro button will then open it.
   Leave it empty ("") until then and the button shows "coming soon".
   ============================================================ */
const PAYSTACK_LINK = "";

const GOLD = "#C9A84C";
const GOLD2 = "#E0C66A";
const BG = "#0E0F13";
const CARD = "#16181F";
const BD = "#2A2D38";
const TXT = "#ECECEC";
const MUT = "#9A9EA8";

const FREE_LIMIT = 5;

const STARTERS = [
  "How do I build a budget on a R15 000 salary?",
  "What is the fastest way to pay off my debt?",
  "How much should I save for an emergency fund?",
  "Explain how compound interest grows my money.",
];

const SYSTEM_NOTE = "Educational information, not licensed financial advice.";

// ---- on-device storage helpers (safe on server render) ----
function lsGet(k, fallback) {
  if (typeof window === "undefined") return fallback;
  try { const v = window.localStorage.getItem(k); return v === null ? fallback : v; }
  catch (e) { return fallback; }
}
function lsSet(k, v) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(k, v); } catch (e) {}
}
function today() { return new Date().toISOString().slice(0, 10); }

function csvEscape(s) {
  let t = String(s == null ? "" : s);
  t = t.split('"').join('""');
  return '"' + t + '"';
}
function buildCsv(rows) {
  const out = [["Date", "Question", "MONEYMAX Advice"].map(csvEscape).join(",")];
  for (let i = 0; i < rows.length; i++) {
    out.push([csvEscape(rows[i].date), csvEscape(rows[i].question), csvEscape(rows[i].answer)].join(","));
  }
  return out.join("\r\n");
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState("welcome");
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [plan, setPlan] = useState("free");      // becomes "plus" only via payment later
  const [testMode, setTestMode] = useState(false);
  const [taps, setTaps] = useState(0);
  const [used, setUsed] = useState(0);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const scrollRef = useRef(null);

  const isPro = testMode || plan === "plus";

  // hydrate from device storage
  useEffect(() => {
    const savedName = lsGet("mm_name", "");
    const savedPlan = lsGet("mm_plan", "free");
    let savedUsed = parseInt(lsGet("mm_used", "0"), 10) || 0;
    const savedDate = lsGet("mm_date", today());
    if (savedDate !== today()) { savedUsed = 0; lsSet("mm_date", today()); lsSet("mm_used", "0"); }
    let savedHistory = [];
    try { savedHistory = JSON.parse(lsGet("mm_history", "[]")) || []; } catch (e) { savedHistory = []; }
    setName(savedName);
    setPlan(savedPlan === "plus" ? "plus" : "free");
    setUsed(savedUsed);
    setHistory(savedHistory);
    if (savedName) setScreen("chat");
    setReady(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  function startApp() {
    const n = nameInput.trim();
    setName(n);
    lsSet("mm_name", n);
    setScreen("chat");
  }

  function tapLogo() {
    const n = taps + 1;
    setTaps(n);
    if (n >= 5) { setTestMode((t) => !t); setTaps(0); }
  }

  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;

    if (!isPro && used >= FREE_LIMIT) { setShowUpgrade(true); return; }

    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, plan: isPro ? "plus" : "free" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", text: "Something went wrong: " + (data.error || "please try again.") }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
        if (!isPro) {
          const nu = used + 1;
          setUsed(nu); lsSet("mm_used", String(nu)); lsSet("mm_date", today());
        }
        if (isPro) {
          const entry = { date: new Date().toISOString().slice(0, 16).replace("T", " "), question: q, answer: data.reply };
          setHistory((h) => {
            const nh = [entry, ...h].slice(0, 300);
            lsSet("mm_history", JSON.stringify(nh));
            return nh;
          });
        }
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Connection error: " + e.message }]);
    }
    setLoading(false);
  }

  function exportCsv() {
    if (!isPro) { setShowUpgrade(true); return; }
    if (history.length === 0) return;
    const csv = buildCsv(history);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "moneymax-financial-history.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function goPro() {
    if (PAYSTACK_LINK) { window.location.href = PAYSTACK_LINK; }
  }

  if (!ready) return <div style={{ height: "100vh", background: BG }} />;

  // ---------------- WELCOME ----------------
  if (screen === "welcome") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "radial-gradient(circle at 50% 0%, #1A1C24 0%, #0E0F13 60%)" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 42, fontWeight: 700, color: "#FFFFFF" }}>MONEY<span style={{ color: GOLD }}>MAX</span></div>
            <div style={{ fontSize: 12, color: MUT, marginTop: 6, letterSpacing: "2px", textTransform: "uppercase" }}>AI Financial Counselor</div>
          </div>
          <div style={{ background: CARD, border: "1px solid " + BD, borderRadius: 18, padding: 24 }}>
            <div style={{ fontSize: 16, color: TXT, lineHeight: 1.6, marginBottom: 16 }}>
              Get clear, practical answers on budgeting, debt, saving and investing — anytime, in plain language.
            </div>
            <div style={{ background: "rgba(201,168,76,0.12)", border: "1px solid " + GOLD, borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
              <div style={{ color: GOLD, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Founder offer</div>
              <div style={{ color: TXT, fontSize: 13, lineHeight: 1.5 }}>The first 100 members get Pro at <strong>R99 (~$6)/mo</strong> — then R149 (~$9).</div>
            </div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: MUT, marginBottom: 6 }}>What should we call you?</label>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") startApp(); }} placeholder="Your first name" style={{ width: "100%", padding: "13px 14px", borderRadius: 11, border: "1px solid " + BD, background: BG, color: TXT, fontSize: 14, marginBottom: 16, boxSizing: "border-box" }} />
            <button onClick={startApp} style={{ width: "100%", padding: 14, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, color: BG, background: "linear-gradient(135deg, " + GOLD + ", " + GOLD2 + ")" }}>Start Free</button>
          </div>
          <p style={{ fontSize: 11, color: "#6B6F7A", lineHeight: 1.6, marginTop: 16, textAlign: "center" }}>
            <strong style={{ color: MUT }}>Educational use only.</strong> MONEYMAX is not a licensed financial advisor. Consult a qualified professional before making financial decisions.
          </p>
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, FREE_LIMIT - used);

  // ---------------- APP ----------------
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG }}>
      <div style={{ background: CARD, borderBottom: "1px solid " + BD }}>
        <div style={{ padding: "11px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={tapLogo} style={{ cursor: "pointer" }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#FFFFFF" }}>MONEY<span style={{ color: GOLD }}>MAX</span></div>
            <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}><span style={{ color: GOLD, fontWeight: 600 }}>{isPro ? "Pro" : "Free"}</span> plan{testMode ? " (test mode)" : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {!isPro && <button onClick={() => setShowUpgrade(true)} style={miniGold}>Upgrade</button>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, padding: "0 16px 10px" }}>
          <button onClick={() => setScreen("chat")} style={navTab(screen === "chat")}>Chat</button>
          <button onClick={() => setScreen("history")} style={navTab(screen === "history")}>History</button>
        </div>
      </div>

      {screen === "chat" && (
        <>
          <div style={{ padding: "6px 16px", background: CARD, borderBottom: "1px solid " + BD, fontSize: 11, color: MUT, textAlign: "center" }}>
            {isPro ? "Unlimited questions" : remaining + " questions left today"}
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {messages.length === 0 && (
              <div style={{ maxWidth: 560, margin: "16px auto 0" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>{name ? "Hi " + name + "," : "Welcome."} ready when you are.</div>
                <div style={{ fontSize: 14, color: MUT, marginBottom: 18, lineHeight: 1.5 }}>Ask anything about money. Try one of these:</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {STARTERS.map((s, i) => (
                    <button key={i} onClick={() => send(s)} style={{ textAlign: "left", padding: "13px 15px", borderRadius: 12, border: "1px solid " + BD, background: CARD, color: TXT, fontSize: 14, cursor: "pointer", lineHeight: 1.4 }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "86%", padding: "12px 15px", borderRadius: 14, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", background: m.role === "user" ? ("linear-gradient(135deg, " + GOLD + ", " + GOLD2 + ")") : CARD, color: m.role === "user" ? BG : TXT, border: m.role === "user" ? "none" : "1px solid " + BD }}>{m.text}</div>
                </div>
              ))}
              {loading && <div style={{ color: MUT, fontSize: 13, padding: "4px 2px" }}>Thinking...</div>}
            </div>
          </div>
          <div style={{ padding: 13, borderTop: "1px solid " + BD, background: CARD }}>
            <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", gap: 8 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Ask about your money..." style={{ flex: 1, padding: "13px 15px", borderRadius: 12, border: "1px solid " + BD, background: BG, color: TXT, fontSize: 14 }} />
              <button onClick={() => send()} disabled={loading} style={{ padding: "0 20px", borderRadius: 12, border: "none", cursor: loading ? "default" : "pointer", fontWeight: 700, fontSize: 14, color: BG, background: "linear-gradient(135deg, " + GOLD + ", " + GOLD2 + ")" }}>Send</button>
            </div>
          </div>
        </>
      )}

      {screen === "history" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>Your saved history</div>
              <button onClick={exportCsv} style={{ padding: "9px 14px", borderRadius: 10, border: isPro ? "none" : "1px solid " + BD, cursor: "pointer", fontSize: 13, fontWeight: 700, color: isPro ? BG : MUT, background: isPro ? ("linear-gradient(135deg, " + GOLD + ", " + GOLD2 + ")") : "transparent" }}>{isPro ? "Download CSV" : "CSV (Pro)"}</button>
            </div>
            {!isPro ? (
              <div style={{ border: "1px solid " + BD, borderRadius: 12, padding: 20, background: CARD }}>
                <div style={{ fontSize: 14, color: TXT, fontWeight: 600, marginBottom: 6 }}>Saved history is a Pro feature</div>
                <div style={{ fontSize: 13, color: MUT, lineHeight: 1.5, marginBottom: 14 }}>Upgrade to Pro to automatically save every question and answer, and export them to a spreadsheet you can take to your financial advisor.</div>
                <button onClick={() => setShowUpgrade(true)} style={{ padding: "11px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: BG, background: "linear-gradient(135deg, " + GOLD + ", " + GOLD2 + ")" }}>Upgrade to Pro</button>
              </div>
            ) : history.length === 0 ? (
              <div style={{ border: "1px dashed " + BD, borderRadius: 12, padding: 24, textAlign: "center", color: MUT, fontSize: 14 }}>No saved conversations yet. Ask a question in the chat and it will appear here.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ border: "1px solid " + BD, borderRadius: 12, padding: 14, background: CARD }}>
                    <div style={{ fontSize: 11, color: GOLD, marginBottom: 6 }}>{h.date}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", marginBottom: 6 }}>{h.question}</div>
                    <div style={{ fontSize: 13, color: MUT, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{h.answer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showUpgrade && (
        <div onClick={() => setShowUpgrade(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: CARD, border: "1px solid " + BD, borderRadius: 18, padding: 24 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>Upgrade to Pro</div>
            <div style={{ fontSize: 13, color: MUT, marginBottom: 14 }}>Everything MONEYMAX offers, one simple plan.</div>
            <div style={{ display: "inline-block", background: "rgba(201,168,76,0.15)", color: GOLD, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginBottom: 12, letterSpacing: "0.5px" }}>FOUNDER OFFER &mdash; FIRST 100 MEMBERS</div>
            <div style={{ border: "1px solid " + GOLD, borderRadius: 13, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, color: GOLD, fontSize: 16 }}>Pro</span>
                <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: 18 }}>R99 <span style={{ fontSize: 12, color: MUT }}>(~$6) /mo</span></span>
              </div>
              <div style={{ fontSize: 12, color: MUT, marginTop: 4, textAlign: "right" }}>then R149 (~$9)/mo after the first 100</div>
              <div style={{ fontSize: 13, color: MUT, marginTop: 12, lineHeight: 1.7 }}>
                {"\u2022"} Unlimited questions every day<br />
                {"\u2022"} Smarter, more capable AI counselor<br />
                {"\u2022"} Saved history of every conversation<br />
                {"\u2022"} CSV export to take to your advisor
              </div>
            </div>
            {PAYSTACK_LINK ? (
              <button onClick={goPro} style={{ width: "100%", padding: 13, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, color: BG, background: "linear-gradient(135deg, " + GOLD + ", " + GOLD2 + ")" }}>Subscribe — R99/mo</button>
            ) : (
              <div style={{ fontSize: 12, color: MUT, textAlign: "center", marginBottom: 4, lineHeight: 1.5 }}>Secure card payments are being connected. You&apos;ll be able to subscribe here shortly.</div>
            )}
            <button onClick={() => setShowUpgrade(false)} style={{ width: "100%", padding: 12, marginTop: 10, borderRadius: 11, border: "1px solid " + BD, cursor: "pointer", fontWeight: 600, fontSize: 14, color: MUT, background: "transparent" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const miniGold = { padding: "8px 13px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: BG, background: "linear-gradient(135deg, " + GOLD + ", " + GOLD2 + ")" };

function navTab(active) {
  return { flex: 1, padding: "10px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: active ? BG : MUT, background: active ? GOLD : "#0E0F13" };
}

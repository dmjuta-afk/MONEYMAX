"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function Dashboard() {
  var [user, setUser] = useState(null);
  var [messages, setMessages] = useState([]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var supabase = createClient();

  useEffect(function() {
    supabase.auth.getUser().then(function(result) {
      if (result.data.user) setUser(result.data.user);
      else window.location.href = "/";
    });
  }, []);

  var handleSend = function() {
    if (!input.trim() || loading) return;
    var userMsg = input;
    setInput("");
    setMessages(function(prev) { return prev.concat([{ role: "user", text: userMsg }]); });
    setLoading(true);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        setMessages(function(prev) { return prev.concat([{ role: "assistant", text: data.reply || "Error: no response" }]); });
        setLoading(false);
      })
      .catch(function(e) {
        setMessages(function(prev) { return prev.concat([{ role: "assistant", text: "Error: " + e.message }]); });
        setLoading(false);
      });
  };

  var handleLogout = function() {
    supabase.auth.signOut().then(function() { window.location.href = "/"; });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F1F4", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg,#6B1F2E,#8A2838)", padding: "16px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0", fontFamily: "Playfair Display", fontSize: "20px", fontWeight: "700" }}>MONEYMAX</h1>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px" }}>AI Financial Counselor</p>
        </div>
        <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
          Sign Out
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#6B6F7A", padding: "40px 20px" }}>
            <p style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>Hello{user && ", " + user.email}!</p>
            <p style={{ fontSize: "14px" }}>Ask me anything about personal finance, budgeting, or money management.</p>
          </div>
        )}
        {messages.map(function(msg, i) {
          return (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%",
                padding: "12px 14px",
                borderRadius: "12px",
                background: msg.role === "user" ? "#6B1F2E" : "#FFFFFF",
                color: msg.role === "user" ? "white" : "#111111",
                fontSize: "14px",
                lineHeight: "1.5",
                boxShadow: msg.role === "user" ? "none" : "0 1px 4px rgba(0,0,0,0.08)"
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {loading && <div style={{ textAlign: "center", color: "#6B6F7A", fontSize: "12px" }}>Thinking...</div>}
      </div>

      <div style={{ padding: "16px", borderTop: "1px solid #D4D7E0", background: "white" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={input}
            onChange={function(e) { setInput(e.target.value); }}
            onKeyPress={function(e) { if (e.key === "Enter") handleSend(); }}
            placeholder="Ask about budgeting, debt, savings..."
            style={{ flex: 1, padding: "12px", border: "1.5px solid #D4D7E0", borderRadius: "10px", fontSize: "14px", outline: "none" }}
          />
          <button onClick={handleSend} disabled={loading} style={{ padding: "12px 20px", background: "#6B1F2E", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

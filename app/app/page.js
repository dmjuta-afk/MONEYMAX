"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function Home() {
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");

  var supabase = createClient();

  var handleSignUp = function() {
    setLoading(true);
    setError("");
    supabase.auth.signUp({ email: email, password: password })
      .then(function(result) {
        if (result.error) setError(result.error.message);
        else {
          setEmail("");
          setPassword("");
          alert("Check your email to confirm signup!");
        }
        setLoading(false);
      })
      .catch(function(e) {
        setError(e.message);
        setLoading(false);
      });
  };

  var handleSignIn = function() {
    setLoading(true);
    setError("");
    supabase.auth.signInWithPassword({ email: email, password: password })
      .then(function(result) {
        if (result.error) setError(result.error.message);
        else window.location.href = "/dashboard";
        setLoading(false);
      })
      .catch(function(e) {
        setError(e.message);
        setLoading(false);
      });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F1F4", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", maxWidth: "400px", width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "Playfair Display", fontSize: "32px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" }}>MONEYMAX</h1>
          <p style={{ fontSize: "14px", color: "#6B6F7A", margin: "0" }}>AI Financial Counselor</p>
        </div>

        {error && <div style={{ background: "#FFE0E0", color: "#CC3A52", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>{error}</div>}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#333333", marginBottom: "6px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={function(e) { setEmail(e.target.value); }}
            placeholder="you@example.com"
            style={{ width: "100%", padding: "12px", border: "1.5px solid #D4D7E0", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#333333", marginBottom: "6px" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            placeholder="••••••••"
            style={{ width: "100%", padding: "12px", border: "1.5px solid #D4D7E0", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
          />
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: loading ? "#CCCCCC" : "#6B1F2E", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginBottom: "12px" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button
          onClick={handleSignUp}
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: "transparent", color: "#6B1F2E", border: "1.5px solid #6B1F2E", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <div style={{ fontSize: "11px", color: "#6B6F7A", marginTop: "20px", lineHeight: "1.6", textAlign: "center" }}>
          <strong>Educational Use Only.</strong> MONEYMAX provides financial information and planning tools for educational purposes. We are not licensed financial advisors. Never make investment, tax, or legal decisions based solely on this tool. Consult qualified professionals for personalized advice.
        </div>
      </div>
    </div>
  );
}

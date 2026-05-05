import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MarkdownRenderer from "../components/MarkdownRenderer";
import "../styles/global.css";

export default function Reviewer() {
  const { token, authAxios } = useAuth();
  const [code, setCode]               = useState("");
  const [response, setResponse]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCol, setSelectedCol] = useState("");
  const [showSavePanel, setShowSavePanel] = useState(false);

  useEffect(() => {
    if (!token) return;
    authAxios({ method: "get", url: "http://localhost:5000/api/collections" })
      .then((res) => setCollections(res.data)).catch(() => {});
  }, [token]);

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(""); setResponse(""); setSaved(false);
    try {
      const res = await axios.post("http://localhost:5000/review", { code });
      setResponse(res.data.review);
      if (token) setShowSavePanel(true);
    } catch {
      setError("Something went wrong. Make sure the server is running.");
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!response) return;
    setSaving(true);
    try {
      await authAxios({
        method: "post", url: "http://localhost:5000/api/reviews/save",
        data: { code, review: response, collectionId: selectedCol || null },
      });
      setSaved(true); setShowSavePanel(false);
    } catch {
      setError("Failed to save review.");
    } finally { setSaving(false); }
  };

  return (
    <div className="reviewer-page">
      <Navbar />
      <div className="reviewer-inner">

        {/* ── Left: Code Input ── */}
        <div className="reviewer-panel">
          <h2 className="panel-title">Paste your code snippet</h2>
          <div className="code-editor-wrap">
            <textarea
              className="code-textarea"
              placeholder={`// Paste your code here...\nfunction example() {\n  // ...\n}`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
            <button
              className="btn-primary large"
              onClick={handleReview}
              disabled={loading || !code.trim()}
            >
              {loading ? "Reviewing…" : "Review with Gemini →"}
            </button>
          </div>
        </div>

        {/* ── Right: Analysis Output ── */}
        <div className="reviewer-panel">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h2 className="panel-title" style={{ margin:0 }}>Review Analysis</h2>
            {response && !saved && (
              <button
                onClick={() => setShowSavePanel(s => !s)}
                style={{
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.35)",
                  borderRadius: 8, color: "#a78bfa", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, padding: "5px 12px",
                  fontFamily: "Inter,sans-serif", transition: "all .2s",
                }}
              >
                {showSavePanel ? "Cancel" : "💾 Save review"}
              </button>
            )}
          </div>

          <div className="review-output">

            {/* Loading */}
            {loading && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:"60px 0" }}>
                <div style={{ display:"flex", gap:6 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width:8, height:8, borderRadius:"50%", background:"#a78bfa",
                      animation:`mdot 1.2s ease-in-out ${i*0.2}s infinite`,
                    }}/>
                  ))}
                </div>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>Gemini is analysing your code…</p>
                <style>{`@keyframes mdot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-8px);opacity:1}}`}</style>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="review-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
                </svg>
                <p style={{ color:"#f87171" }}>{error}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && !response && (
              <div className="review-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4" strokeLinecap="round"/>
                </svg>
                <p>Paste your code and click review to start the analysis.</p>
              </div>
            )}

            {/* ── Rich output ── */}
            {!loading && response && (
              <>
                {/* Save panel */}
                {token && showSavePanel && !saved && (
                  <div style={{
                    marginBottom: 20, padding: "16px 18px",
                    background: "rgba(124,58,237,0.08)", borderRadius: 12,
                    border: "1px solid rgba(124,58,237,0.25)",
                  }}>
                    <p style={{ fontSize:13, fontWeight:600, marginBottom:10, color:"rgba(255,255,255,0.8)" }}>
                      Save to collection
                    </p>
                    <select
                      value={selectedCol}
                      onChange={(e) => setSelectedCol(e.target.value)}
                      style={{
                        width:"100%", padding:"8px 12px", borderRadius:8,
                        border:"1px solid rgba(255,255,255,0.1)", fontSize:13,
                        fontFamily:"Inter,sans-serif", marginBottom:10,
                        background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.8)",
                        outline:"none",
                      }}
                    >
                      <option value="" style={{ background:"#0d0d2b" }}>No collection (standalone)</option>
                      {collections.map((c) => (
                        <option key={c._id} value={c._id} style={{ background:"#0d0d2b" }}>{c.name}</option>
                      ))}
                    </select>
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving…" : "Save review →"}
                    </button>
                  </div>
                )}

                {/* Saved confirmation */}
                {saved && (
                  <div style={{
                    marginBottom: 16, padding: "10px 16px", borderRadius: 10,
                    background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)",
                    display:"flex", alignItems:"center", gap:8,
                  }}>
                    <span style={{ fontSize:16 }}>✓</span>
                    <p style={{ fontSize:13, color:"#34d399", fontWeight:600, margin:0 }}>
                      Review saved to your collection
                    </p>
                  </div>
                )}

                {/* Rendered markdown */}
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: "24px",
                }}>
                  <MarkdownRenderer text={response} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
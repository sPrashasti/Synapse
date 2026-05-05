/* The above code is a React functional component called `CollectionDetail`. Here is a summary of what
the code is doing: */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MarkdownRenderer from "../components/MarkdownRenderer";
import "../styles/global.css";

export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authAxios } = useAuth();

  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [colName, setColName]         = useState("");
  const [expanded, setExpanded]       = useState(null);

  useEffect(() => {
    // Fetch collection name from the collections list
    authAxios({ method: "get", url: "http://localhost:5000/api/collections" })
      .then((res) => {
        const col = res.data.find((c) => c._id === id);
        if (col) setColName(col.name);
      })
      .catch(() => {});

    // Fetch reviews in this collection
    authAxios({ method: "get", url: `http://localhost:5000/api/reviews/${id}` })
      .then((res) => setReviews(res.data))
      .catch(() => setError("Failed to load reviews."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: "var(--mesh)", borderBottom: "1px solid var(--border)",
        padding: "48px 48px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}/>
        <button onClick={() => navigate("/collections")} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.4)",
          cursor: "pointer", fontSize: "13px", fontFamily: "Inter,sans-serif",
          padding: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px",
          transition: "color .2s", position: "relative",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
        >
          ← My Collections
        </button>
        <h1 style={{
          fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,40px)",
          fontWeight: 700, color: "var(--text)", position: "relative",
        }}>
          {colName || "Collection"}
        </h1>
        <p style={{ color: "var(--text-mid)", fontSize: "14px", marginTop: "6px", position: "relative" }}>
          {loading ? "Loading…" : `${reviews.length} saved review${reviews.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "40px 56px", width: "100%", boxSizing: "border-box" }}>
        {error && <p style={{ color: "#f87171", fontSize: "14px" }}>{error}</p>}

        {!loading && reviews.length === 0 && !error && (
          <div style={{
            textAlign: "center", padding: "80px 0",
            color: "rgba(255,255,255,0.3)", fontSize: "15px",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
            <p>No reviews saved to this collection yet.</p>
            <button className="btn-primary" style={{ marginTop: "24px" }}
              onClick={() => navigate("/review")}>
              Review some code →
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((rev, idx) => (
            <div key={rev._id} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px", overflow: "hidden",
              transition: "border-color .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(167,139,250,0.35)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            >
              {/* Card header — always visible */}
              <div
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                style={{
                  padding: "20px 24px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <div>
                  <p style={{
                    fontSize: "12px", color: "rgba(255,255,255,0.35)",
                    marginBottom: "4px", fontFamily: "JetBrains Mono,Fira Code,monospace",
                  }}>
                    {new Date(rev.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                  <p style={{
                    fontSize: "13px", color: "rgba(255,255,255,0.7)",
                    fontFamily: "JetBrains Mono,Fira Code,monospace",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    maxWidth: "calc(100% - 40px)",
                  }}>
                    {rev.code.slice(0, 80).replace(/\n/g, " ")}…
                  </p>
                </div>
                <span style={{
                  color: "rgba(167,139,250,0.8)", fontSize: "18px",
                  transform: expanded === idx ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform .25s",
                }}>⌄</span>
              </div>

              {/* Expanded content */}
              {expanded === idx && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "0 24px 24px" }}>
                  {/* Code block */}
                  <p style={{
                    fontSize: "11px", fontWeight: 600, color: "var(--accent)",
                    letterSpacing: ".05em", textTransform: "uppercase",
                    marginTop: "20px", marginBottom: "8px",
                  }}>Code</p>
                  <div style={{
                    background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, overflow: "hidden",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.03)",
                    }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {["#f87171","#fbbf24","#34d399"].map((c, idx) => (
                          <div key={idx} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: .7 }}/>
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase" }}>code</span>
                    </div>
                    <pre style={{
                      margin: 0, padding: "16px 20px", overflowX: "auto",
                      fontFamily: "JetBrains Mono,Fira Code,monospace",
                      fontSize: "12.5px", lineHeight: 1.75, color: "#c4b5fd",
                    }}>
                      <code>{rev.code}</code>
                    </pre>
                  </div>

                  {/* AI Review rendered as markdown */}
                  <p style={{
                    fontSize: "11px", fontWeight: 600, color: "var(--accent)",
                    letterSpacing: ".05em", textTransform: "uppercase",
                    marginTop: "24px", marginBottom: "12px",
                  }}>AI Review</p>
                  <div style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, padding: "20px 22px",
                  }}>
                    <MarkdownRenderer text={rev.review} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

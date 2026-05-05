import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/global.css";

/* ── All local bugs ── */
const ALL_BUGS = [
  {
    id: 1, title: "The Phantom Re-render", tags: ["React"], difficulty: "Intermediate",
    desc: "A component re-renders infinitely despite no visible state change. The culprit is an object dependency in useEffect that fails reference equality on every render.",
    analysis: {
      rootCause: "React compares dependencies by reference, not by value. When you pass an object or array literal directly into useEffect's dependency array (e.g. [{ id: 1 }]), a new reference is created on every render — so React always sees it as 'changed' and fires the effect, which triggers a re-render, which creates a new object, infinitely.",
      fix: "Move the object outside the component, wrap it in useMemo, or extract only the primitive values you actually need as dependencies.",
      code: `// ❌ Broken — new object reference every render\nuseEffect(() => {\n  fetchData();\n}, [{ userId: user.id }]);\n\n// ✅ Fixed — stable primitive dependency\nuseEffect(() => {\n  fetchData();\n}, [user.id]);`,
    },
  },
  {
    id: 2, title: "The Silent Promise Leak", tags: ["JavaScript"], difficulty: "Advanced",
    desc: "An unresolved promise keeps a closure alive long after a component unmounts, leading to state updates on an unmounted component and subtle memory leaks.",
    analysis: {
      rootCause: "When a component unmounts while an async operation is still in flight, the promise's .then() callback still holds a reference to setState. Calling setState on an unmounted component wastes work and can cause subtle bugs if the closed-over values are stale.",
      fix: "Use an AbortController to cancel fetch requests, or an isMounted flag inside the effect's cleanup function to suppress state updates after unmount.",
      code: `// ✅ Fixed with AbortController\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch('/api/data', { signal: controller.signal })\n    .then(r => r.json())\n    .then(data => setData(data))\n    .catch(err => {\n      if (err.name !== 'AbortError') setError(err);\n    });\n  return () => controller.abort();\n}, []);`,
    },
  },
  {
    id: 3, title: "The Cascade Delete Trap", tags: ["Database"], difficulty: "Intermediate",
    desc: "A foreign key constraint with ON DELETE CASCADE silently removes child records when a parent is deleted, causing data loss that only surfaces days later.",
    analysis: {
      rootCause: "ON DELETE CASCADE is convenient but dangerous. Deleting a parent row automatically deletes all child rows in every table that references it — silently, with no application-level warning.",
      fix: "Prefer ON DELETE RESTRICT to force explicit cleanup. Alternatively, use soft deletes (a deleted_at timestamp) so nothing is ever truly erased.",
      code: `-- ❌ Dangerous: child rows vanish silently\nCREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  user_id INT REFERENCES users(id) ON DELETE CASCADE\n);\n\n-- ✅ Safer: deletion is blocked until children are handled\nCREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  user_id INT REFERENCES users(id) ON DELETE RESTRICT\n);`,
    },
  },
  {
    id: 4, title: "The CORS Preflight Ghost", tags: ["Networking"], difficulty: "Beginner",
    desc: "An OPTIONS preflight request succeeds but the actual POST request fails. The issue: Access-Control-Allow-Headers is missing the custom Authorization header.",
    analysis: {
      rootCause: "Browsers send an OPTIONS preflight before any cross-origin request that uses non-simple headers (like Authorization). If the server's Access-Control-Allow-Headers response doesn't explicitly list Authorization, the browser blocks the real request.",
      fix: "Add Authorization (and any other custom headers) to Access-Control-Allow-Headers on the server.",
      code: `// ✅ Express + cors fix\napp.use(cors({\n  origin: 'https://yourfrontend.com',\n  allowedHeaders: ['Content-Type', 'Authorization'],\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n}));`,
    },
  },
  {
    id: 5, title: "The Event Loop Block", tags: ["Node.js"], difficulty: "Advanced",
    desc: "A CPU-intensive synchronous operation on the main thread starves all other requests. A setTimeout trick masks the problem until load increases.",
    analysis: {
      rootCause: "Node.js is single-threaded. A tight synchronous loop blocks the event loop — no other requests, timers, or I/O callbacks can run until it finishes.",
      fix: "Offload CPU-heavy work to a Worker Thread, a child process, or a dedicated microservice.",
      code: `// ✅ Offload to a Worker Thread\nconst { Worker } = require('worker_threads');\n\napp.get('/heavy', (req, res) => {\n  const worker = new Worker('./heavyTask.js', {\n    workerData: req.query,\n  });\n  worker.on('message', result => res.json(result));\n  worker.on('error', err => res.status(500).json({ error: err.message }));\n});`,
    },
  },
  {
    id: 6, title: "The z-index War", tags: ["CSS"], difficulty: "Beginner",
    desc: "A modal appears behind a sibling element despite having z-index: 9999. The real cause: a parent with transform creates a new stacking context.",
    analysis: {
      rootCause: "A stacking context is created by any element with: position + z-index, opacity < 1, transform, filter, isolation: isolate. Once a new stacking context exists, all z-index values inside it are local.",
      fix: "Move the modal to a top-level DOM node via a React Portal into document.body.",
      code: `// ✅ React Portal — modal renders at document.body level\nimport { createPortal } from 'react-dom';\n\nfunction Modal({ children }) {\n  return createPortal(\n    <div className="modal-overlay">{children}</div>,\n    document.body\n  );\n}`,
    },
  },
  {
    id: 7, title: "The Stale Closure Trap", tags: ["React", "JavaScript"], difficulty: "Intermediate",
    desc: "An event handler references a state value from the initial render, ignoring all subsequent updates. Classic closure-over-stale-state pattern.",
    analysis: {
      rootCause: "When a function is created inside a React component, it closes over the state values at the time of creation. If that function is never re-created, it will always 'see' the original values.",
      fix: "Use the functional updater form of setState (setCount(c => c + 1)) or store the value in a ref.",
      code: `// ❌ Stale — count is always 0\nuseEffect(() => {\n  const id = setInterval(() => setCount(count + 1), 1000);\n  return () => clearInterval(id);\n}, []);\n\n// ✅ Fixed — functional updater\nuseEffect(() => {\n  const id = setInterval(() => setCount(c => c + 1), 1000);\n  return () => clearInterval(id);\n}, []);`,
    },
  },
  {
    id: 8, title: "The N+1 Query", tags: ["Database", "General"], difficulty: "Intermediate",
    desc: "Fetching a list of 100 users then making a separate query for each user's profile. 101 queries where 1 join would have sufficed.",
    analysis: {
      rootCause: "N+1 happens when code fetches a list (1 query) then loops over it and fires an individual query per item (N queries). ORMs make this especially easy to stumble into.",
      fix: "Use a JOIN or an eager-load option in your ORM to fetch all the data in one round-trip.",
      code: `// ❌ N+1 — 101 queries for 100 users\nconst users = await User.find();\nfor (const user of users) {\n  user.profile = await Profile.findOne({ userId: user._id });\n}\n\n// ✅ Fixed — 1 query with populate\nconst users = await User.find().populate('profile');`,
    },
  },
];

const ALL_TAGS = ["All","React","Database","JavaScript","Node.js","Networking","General","CSS"];

/* ── Web result card ── */
function WebResultCard({ item }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "14px", padding: "18px 20px", cursor: "pointer",
        transition: "all .2s",
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)";
          e.currentTarget.style.background  = "rgba(255,255,255,0.07)";
          e.currentTarget.style.transform   = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
          e.currentTarget.style.background  = "rgba(255,255,255,0.04)";
          e.currentTarget.style.transform   = "translateY(0)";
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          {/* SO icon */}
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg,#f48024,#de6c16)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>S</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.88)",
              marginBottom: 4, lineHeight: 1.4,
            }}
              dangerouslySetInnerHTML={{ __html: item.title }}
            />
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {item.tags.map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 100,
                  background: "rgba(124,58,237,0.2)", color: "#a78bfa",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}>{t}</span>
              ))}
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                {item.answers} answer{item.answers !== 1 ? "s" : ""}
                {item.answered && " ✓"}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                ▲ {item.score}
              </span>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.35, marginTop: 2 }}>
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </a>
  );
}

export default function Library() {
  const [search,      setSearch]      = useState("");
  const [activeTag,   setActiveTag]   = useState("All");
  const [selectedBug, setSelectedBug] = useState(null);

  // Web search state
  const [webResults,  setWebResults]  = useState(null);   // { stackoverflow, ddg, related }
  const [webLoading,  setWebLoading]  = useState(false);
  const [webError,    setWebError]    = useState("");
  const [webQuery,    setWebQuery]    = useState("");

  const filtered = ALL_BUGS.filter((bug) => {
    const matchTag    = activeTag === "All" || bug.tags.includes(activeTag);
    const matchSearch = !search ||
      bug.title.toLowerCase().includes(search.toLowerCase()) ||
      bug.desc.toLowerCase().includes(search.toLowerCase()) ||
      bug.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchTag && matchSearch;
  });

  /* Search internet on Enter */
  const handleWebSearch = async (e) => {
    if (e.key !== "Enter" || !search.trim()) return;
    setWebLoading(true); setWebError(""); setWebResults(null); setWebQuery(search.trim());
    try {
      const res = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(search.trim())}`);
      setWebResults(res.data);
    } catch {
      setWebError("Search failed. Make sure the server is running.");
    } finally {
      setWebLoading(false);
    }
  };

  const clearWeb = () => { setWebResults(null); setWebQuery(""); };

  return (
    <div className="library-page">
      <Navbar />

      {/* Hero */}
      <div className="library-hero">
        <h1>Debugging, <em style={{ fontStyle:"italic", background:"linear-gradient(135deg,#a78bfa,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>indexed.</em></h1>
        <p>Real production failures, turned into mental models. Browse by category or search by keyword — or <strong style={{ color: "rgba(255,255,255,0.7)" }}>press Enter</strong> to search the internet.</p>

        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search patterns, tags, stacks… or press Enter to search web"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleWebSearch}
          />
          {search && (
            <button onClick={() => { setSearch(""); clearWeb(); }}
              style={{ background:"none",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:16,padding:"0 4px" }}>
              ✕
            </button>
          )}
        </div>

        {/* Hint */}
        {search && !webResults && !webLoading && (
          <p style={{ position:"relative", fontSize:"12px", color:"rgba(255,255,255,0.3)", marginTop:"8px" }}>
            Press <kbd style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:4, padding:"1px 5px", fontSize:11 }}>Enter</kbd> to search the internet for "{search}"
          </p>
        )}
      </div>

      {/* Body */}
      <div className="library-body">
        {/* Filter Tags */}
        <div className="filter-tags">
          {ALL_TAGS.map(tag => (
            <button key={tag} className={`filter-tag${activeTag===tag?" active":""}`}
              onClick={() => setActiveTag(tag)}>{tag}</button>
          ))}
        </div>

        {/* Local bug cards */}
        {filtered.length === 0 && !webResults ? (
          <div style={{ textAlign:"center", padding:"40px 0 20px", color:"rgba(255,255,255,0.3)", fontSize:14 }}>
            No local results for "{search}". Press <strong>Enter</strong> to search the internet.
          </div>
        ) : (
          <>
            {/* compact label when web results are showing */}
            {webResults && filtered.length > 0 && (
              <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>
                Local · {filtered.length} match{filtered.length !== 1 ? "es" : ""}
              </p>
            )}

            {/* ── Normal big cards (no web results active) ── */}
            {!webResults && (
              <div className="bug-cards">
                {filtered.map(bug => (
                  <div key={bug.id} className="bug-card" style={{ cursor:"pointer" }}>
                    <div className="bug-card-tags">
                      {bug.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
                      <span className="tag-pill difficulty">{bug.difficulty}</span>
                    </div>
                    <h3>{bug.title}</h3>
                    <p>{bug.desc}</p>
                    <button className="view-analysis" onClick={() => setSelectedBug(bug)}>View analysis →</button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Compact horizontal cards (web results active) ── */}
            {webResults && filtered.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 8,
                marginBottom: 28,
              }}>
                {filtered.map(bug => (
                  <div key={bug.id}
                    onClick={() => setSelectedBug(bug)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      transition: "all .18s",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(167,139,250,0.4)"; e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.09)"; e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
                  >
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 600,
                        color: "rgba(255,255,255,0.85)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        marginBottom: 4,
                      }}>{bug.title}</p>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {bug.tags.map(t => (
                          <span key={t} style={{
                            fontSize: 10, padding: "1px 7px", borderRadius: 100,
                            background: "rgba(124,58,237,0.2)", color: "#a78bfa",
                            border: "1px solid rgba(124,58,237,0.25)",
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Web search results ── */}
        {(webLoading || webResults || webError) && (
          <div style={{ marginTop: 40 }}>
            {/* Section header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{
                  width:28, height:28, borderRadius:8, flexShrink:0,
                  background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 style={{ fontSize:16, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>
                  Web results for <em style={{ fontStyle:"normal", color:"#a78bfa" }}>"{webQuery}"</em>
                </h3>
              </div>
              <button onClick={clearWeb} style={{
                background:"none", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:8, color:"rgba(255,255,255,0.4)", cursor:"pointer",
                fontSize:12, padding:"4px 10px", fontFamily:"Inter,sans-serif",
              }}>Clear</button>
            </div>

            {webLoading && (
              <div style={{ display:"flex", gap:6, padding:"20px 0" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:8, height:8, borderRadius:"50%", background:"#a78bfa",
                    animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`,
                  }}/>
                ))}
                <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-8px);opacity:1}}`}</style>
              </div>
            )}

            {webError && <p style={{ color:"#f87171", fontSize:13 }}>{webError}</p>}

            {webResults && (
              <>
                {/* DDG abstract */}
                {webResults.ddg && (
                  <div style={{
                    background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.25)",
                    borderRadius:14, padding:"16px 20px", marginBottom:20,
                  }}>
                    <p style={{ fontSize:12, fontWeight:600, color:"#a78bfa", marginBottom:6, textTransform:"uppercase", letterSpacing:".05em" }}>
                      Quick Answer · {webResults.ddg.source}
                    </p>
                    <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", lineHeight:1.65 }}>{webResults.ddg.text}</p>
                    <a href={webResults.ddg.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:12, color:"#a78bfa", marginTop:8, display:"inline-block" }}>
                      Read more →
                    </a>
                  </div>
                )}

                {/* StackOverflow results */}
                {webResults.stackoverflow?.length > 0 && (
                  <>
                    <p style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:12 }}>
                      StackOverflow · {webResults.stackoverflow.length} results
                    </p>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {webResults.stackoverflow.map((item, i) => (
                        <WebResultCard key={i} item={item} />
                      ))}
                    </div>
                  </>
                )}

                {/* Related topics */}
                {webResults.related?.length > 0 && (
                  <div style={{ marginTop:24 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:12 }}>
                      Related Topics
                    </p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {webResults.related.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                          style={{ textDecoration:"none" }}>
                          <span style={{
                            fontSize:12, padding:"6px 14px", borderRadius:100,
                            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                            color:"rgba(255,255,255,0.65)", display:"inline-block",
                            transition:"all .2s", cursor:"pointer",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background="rgba(124,58,237,0.2)"; e.currentTarget.style.borderColor="rgba(124,58,237,0.4)"; e.currentTarget.style.color="#a78bfa"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.65)"; }}
                          >
                            {r.title}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {webResults.stackoverflow?.length === 0 && !webResults.ddg && (
                  <p style={{ color:"rgba(255,255,255,0.3)", fontSize:14, padding:"20px 0" }}>
                    No internet results found for this query. Try different keywords.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {selectedBug && (
        <div className="modal-overlay" onClick={() => setSelectedBug(null)}>
          <div className="analysis-modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBug(null)}>✕</button>
            <div className="modal-tags">
              {selectedBug.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
              <span className="tag-pill difficulty">{selectedBug.difficulty}</span>
            </div>
            <h2 className="modal-title">{selectedBug.title}</h2>
            <p className="modal-desc">{selectedBug.desc}</p>
            <div className="modal-section">
              <h4>🔍 Root Cause</h4>
              <p>{selectedBug.analysis.rootCause}</p>
            </div>
            <div className="modal-section">
              <h4>✅ Fix</h4>
              <p>{selectedBug.analysis.fix}</p>
            </div>
            <div className="modal-section">
              <h4>💻 Code</h4>
              <pre className="modal-code"><code>{selectedBug.analysis.code}</code></pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

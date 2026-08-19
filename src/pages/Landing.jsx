import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Lottie from "lottie-react";
import "../styles/global.css";
import "../styles/landing-hero.css";

/* ── Floating particles (stable, no random on re-render) ── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left:    `${(i * 37 + 11) % 100}%`,
  top:     `${(i * 53 + 7)  % 100}%`,
  delay:   `${((i * 0.7) % 6).toFixed(2)}s`,
  dur:     `${(4 + (i * 0.9) % 6).toFixed(2)}s`,
  size:    `${2 + (i % 4)}px`,
  opacity: (0.2 + (i % 5) * 0.08).toFixed(2),
}));

/* ── Lottie ML Animation ── */
function LottieRobot({ robotRef }) {
  return (
    <div className="lh-robot-scene" ref={robotRef}>
      <Lottie
        path="https://assets-v2.lottiefiles.com/a/1fd53a68-118a-11ee-82bd-13ef09c2cdae/Hxyzcjn4mA.json"
        loop
        autoplay
        style={{
          width: "100%",
          height: "auto",
          filter: "drop-shadow(0 0 50px rgba(99,102,241,0.5)) drop-shadow(0 20px 60px rgba(109,40,217,0.4))",
        }}
      />
      <div className="lh-robot-card lh-rc-1"><span className="lh-rc-icon">💬</span><span className="lh-rc-text">Debugging…</span></div>
      <div className="lh-robot-card lh-rc-2"><span className="lh-rc-icon">⚡</span><span className="lh-rc-text">AI Ready</span></div>
      <div className="lh-robot-card lh-rc-3"><span className="lh-rc-icon">🧠</span><span className="lh-rc-text">Analyzing</span></div>
      <div className="lh-robot-card lh-rc-4"><span className="lh-rc-icon">✅</span><span className="lh-rc-text">Solved!</span></div>
      <div className="lh-robot-glow-ring" />
    </div>
  );
}


export default function Landing() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const heroRef  = useRef(null);
  const robotRef = useRef(null);
  const orb1Ref  = useRef(null);
  const orb2Ref  = useRef(null);
  const target   = useRef({ x: 0, y: 0 });
  const current  = useRef({ x: 0, y: 0 });
  const raf      = useRef(null);

  const lerp = (a, b, t) => a + (b - a) * t;

  const animate = useCallback(() => {
    current.current.x = lerp(current.current.x, target.current.x, 0.055);
    current.current.y = lerp(current.current.y, target.current.y, 0.055);
    const { x, y } = current.current;
    if (robotRef.current) {
      robotRef.current.style.transform = `
        translate(${x * 22}px, ${y * 14}px)
        rotateY(${x * 14}deg)
        rotateX(${-y * 9}deg)
      `;
    }
    if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${x * -35}px, ${y * -25}px)`;
    if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${x * 28}px, ${y * 20}px)`;
    raf.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      target.current = {
        x: ((e.clientX - r.left) / r.width  - 0.5) * 2,
        y: ((e.clientY - r.top)  / r.height - 0.5) * 2,
      };
    };
    hero?.addEventListener("mousemove", onMove);
    raf.current = requestAnimationFrame(animate);
    return () => {
      hero?.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [animate]);

  return (
    <div className="landing-page">
      <Navbar />

      <section className="lh-hero" ref={heroRef}>
        <div className="lh-mesh-bg" />
        <div className="lh-orb lh-orb-1" ref={orb1Ref} />
        <div className="lh-orb lh-orb-2" ref={orb2Ref} />

        <div className="lh-particles" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span key={i} className="lh-particle" style={{
              left: p.left, top: p.top,
              animationDelay: p.delay, animationDuration: p.dur,
              width: p.size, height: p.size, opacity: p.opacity,
            }} />
          ))}
        </div>

        <div className="lh-grid-lines" />

        <div className="lh-content">
          <div className="lh-text-side">
           
            <h1 className="lh-headline">
              Debug the <span className="lh-grad-text">logic</span>,<br />
              not just the<br />error.
            </h1>
            <p className="lh-sub">
              Synapse is a Socratic debugging companion for engineers who
              want to understand the bug — not just silence it. Build
              intuition. Save what you learn.
            </p>
            <div className="lh-buttons">
              <button id="cta-primary" className="lh-btn-primary"
                onClick={() => navigate(token ? "/review" : "/signup")}>
                <span>Start debugging smarter</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button id="cta-secondary" className="lh-btn-secondary" onClick={() => navigate("/library")}>
                Browse the library
              </button>
            </div>
          </div>

          <div className="lh-robot-side">
            <LottieRobot robotRef={robotRef} />
          </div>
        </div>

        <div className="lh-fade-bottom" />
      </section>

      <section className="lh-stats">
        {[
          { num: "100%", label: "Responsive" },
          { num: "98%",   label: "Bug clarity rate" },
          { num: "10×",   label: "Faster root-cause" },
          { num: "∞",     label: "Free sessions" },
        ].map((s) => (
          <div key={s.label} className="lh-stat">
            <span className="lh-stat-num">{s.num}</span>
            <span className="lh-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="lh-features">
        <div className="lh-features-header">
          <div className="lh-section-eyebrow">✦ Why Synapse</div>
          <h2 className="lh-features-title">
            Built for engineers who<br />think in systems
          </h2>
          <p className="lh-features-sub">
            Not just a linter. Synapse guides you through the <em>why</em> behind
            every bug, so you never hit the same wall twice.
          </p>
        </div>
        <div className="lh-features-grid">
          {[
            {
              icon: "🧠",
              title: "Socratic Reasoning",
              desc: "Instead of handing you the fix, Synapse asks the right questions — walking you step-by-step through the root cause so the insight actually sticks.",
            },
            {
              icon: "🔍",
              title: "Root-Cause Analysis",
              desc: "Surface hidden assumptions, trace data flow, and pin-point exactly where your logic diverges from your intent — in seconds.",
            },
            {
              icon: "📚",
              title: "Persistent Library",
              desc: "Every debugging session becomes a searchable note in your personal bug library. Build institutional knowledge, not just muscle memory.",
            },
            {
              icon: "⚡",
              title: "Instant AI Review",
              desc: "Paste your code, get a structured analysis back within moments. No boilerplate prompting — Synapse knows what to look for.",
            },
            {
              icon: "🗂️",
              title: "Smart Collections",
              desc: "Group related bugs into collections by project, language, or theme. Revisit patterns before starting new features.",
            },
            {
              icon: "🔒",
              title: "Private & Secure",
              desc: "Your code never leaves your authenticated session. Collections are end-to-end isolated per account — your IP stays yours.",
            },
          ].map((f) => (
            <div key={f.title} className="lh-feature-card">
              <div className="lh-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="lh-feature-glow" />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <div className="landing-cta-badge">✦ Start for free today</div>
          <h2>
            Ready to think like the{" "}
            <em className="lh-grad-text" style={{ fontStyle: "italic" }}>best</em>?
          </h2>
          <p>Create your free account and start your first collection in under a minute. No credit card required.</p>
          <div className="landing-cta-actions">
            <button className="btn-primary large" onClick={() => navigate(token ? "/review" : "/signup")}>
              Join Synapse →
            </button>
            <button className="btn-secondary large" onClick={() => navigate("/library")}>
              Explore the library
            </button>
          </div>
          <div className="landing-cta-trust">
            <div className="landing-cta-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Free forever plan
            </div>
            <div className="landing-cta-trust-sep"/>
            <div className="landing-cta-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              No credit card
            </div>
            <div className="landing-cta-trust-sep"/>
            <div className="landing-cta-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Set up in 60 seconds
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
/* ════════════════════════════════════════════════════════════════
   MarkdownRenderer — shared lightweight markdown renderer
   Handles: h1-h3, bold, italic, inline-code, fenced code blocks,
            bullet lists, numbered lists, hr, paragraphs
   ════════════════════════════════════════════════════════════════ */

function renderInline(text) {
  const parts = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let last = 0, m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2])      parts.push(<strong key={m.index}><em>{m[2]}</em></strong>);
    else if (m[3]) parts.push(<strong key={m.index}>{m[3]}</strong>);
    else if (m[4]) parts.push(<em key={m.index}>{m[4]}</em>);
    else if (m[5]) parts.push(
      <code key={m.index} style={{
        background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 5, padding: "1px 6px", fontSize: "0.82em",
        fontFamily: "JetBrains Mono,Fira Code,monospace", color: "#c4b5fd",
      }}>{m[5]}</code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

export default function MarkdownRenderer({ text }) {
  if (!text) return null;
  const lines  = text.split("\n");
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block ──────────────────────────────────────
    if (line.trimStart().startsWith("```")) {
      const lang = line.replace(/```/, "").trim() || "code";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      output.push(
        <div key={`code-${i}`} style={{ margin: "16px 0" }}>
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
              <span style={{
                fontSize: 11, color: "rgba(255,255,255,0.3)",
                fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase",
              }}>{lang}</span>
            </div>
            <pre style={{
              margin: 0, padding: "16px 20px", overflowX: "auto",
              fontFamily: "JetBrains Mono,Fira Code,monospace",
              fontSize: "12.5px", lineHeight: 1.75, color: "#c4b5fd",
            }}>
              <code>{codeLines.join("\n")}</code>
            </pre>
          </div>
        </div>
      );
      i++; continue;
    }

    // ── Horizontal rule ────────────────────────────────────────
    if (/^---+$/.test(line.trim())) {
      output.push(<hr key={`hr-${i}`} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "20px 0" }}/>);
      i++; continue;
    }

    // ── Headings ───────────────────────────────────────────────
    const h1 = line.match(/^#\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);

    if (h1) {
      output.push(
        <h2 key={`h1-${i}`} style={{
          fontSize: "clamp(18px,2vw,22px)", fontWeight: 700, color: "#fff",
          marginTop: 24, marginBottom: 8, lineHeight: 1.3,
          borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 8,
        }}>{renderInline(h1[1])}</h2>
      );
      i++; continue;
    }
    if (h2) {
      output.push(
        <h3 key={`h2-${i}`} style={{
          fontSize: "clamp(14px,1.8vw,17px)", fontWeight: 700, color: "rgba(255,255,255,0.9)",
          marginTop: 22, marginBottom: 6, display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            display: "inline-block", width: 3, height: "1em", borderRadius: 2,
            background: "linear-gradient(135deg,#7c3aed,#60a5fa)", flexShrink: 0,
          }}/>
          {renderInline(h2[1])}
        </h3>
      );
      i++; continue;
    }
    if (h3) {
      output.push(
        <h4 key={`h3-${i}`} style={{
          fontSize: "13px", fontWeight: 700, color: "#a78bfa",
          marginTop: 16, marginBottom: 4,
          textTransform: "uppercase", letterSpacing: ".06em",
        }}>{renderInline(h3[1])}</h4>
      );
      i++; continue;
    }

    // ── Bullet list ────────────────────────────────────────────
    if (/^[\s]*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[\s]*[-*]\s+/.test(lines[i])) {
        const indent = lines[i].match(/^(\s*)/)[1].length;
        items.push({ text: lines[i].replace(/^[\s]*[-*]\s+/, ""), indent });
        i++;
      }
      output.push(
        <ul key={`ul-${i}`} style={{ margin: "8px 0", paddingLeft: 0, listStyle: "none" }}>
          {items.map((item, idx) => (
            <li key={idx} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              marginBottom: 5, paddingLeft: item.indent > 2 ? 20 : 0,
            }}>
              <span style={{
                marginTop: 7, width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                background: item.indent > 2 ? "rgba(167,139,250,0.4)" : "#7c3aed",
              }}/>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.78)", lineHeight: 1.65 }}>
                {renderInline(item.text)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered list ──────────────────────────────────────────
    if (/^\d+\.\s+/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].replace(/^\d+\.\s+/, "").trim());
        i++;
      }
      output.push(
        <ol key={`ol-${i}`} style={{ margin: "8px 0", paddingLeft: 0, listStyle: "none" }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 6 }}>
              <span style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#a78bfa",
              }}>{idx + 1}</span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.78)", lineHeight: 1.65, paddingTop: 2 }}>
                {renderInline(item)}
              </span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Empty line ─────────────────────────────────────────────
    if (line.trim() === "") {
      output.push(<div key={`gap-${i}`} style={{ height: 6 }}/>);
      i++; continue;
    }

    // ── Paragraph ─────────────────────────────────────────────
    output.push(
      <p key={`p-${i}`} style={{
        fontSize: "14px", color: "rgba(255,255,255,0.72)",
        lineHeight: 1.75, margin: "4px 0",
      }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div style={{ fontFamily: "Inter,sans-serif" }}>{output}</div>;
}

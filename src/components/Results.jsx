// src/components/Results.jsx
export function Badge({ children }) {
    return (
      <span style={{
        border: "1px solid #ddd",
        borderRadius: 999,
        padding: "2px 8px",
        marginRight: 6,
        fontSize: 12
      }}>
        {children}
      </span>
    );
  }
  
  export function SentimentSummary({ results }) {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    for (const r of results) counts[r.ai.sentiment] = (counts[r.ai.sentiment] || 0) + 1;
    const predominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    return (
      <div style={{ margin: "8px 0 16px 0" }}>
        <b>Conteo:</b> 👍 {counts.positive} · 😐 {counts.neutral} · 👎 {counts.negative} <br />
        <b>Percepción predominante:</b> {predominant}
      </div>
    );
  }
  
  export default function Results({ data }) {
    if (!data?.results?.length) return null;
    return (
      <div style={{ marginTop: 24 }}>
        <h2>Resultados</h2>
        <SentimentSummary results={data.results} />
        <div>
          {data.results.map((r, idx) => (
            <div key={idx} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, margin: "12px 0" }}>
              <div style={{ fontSize: 12, color: "#555" }}>
                <b>{(r.meta.platform || "").toUpperCase()}</b> ·{" "}
                <a href={r.meta.url} target="_blank" rel="noreferrer">Ver</a>
              </div>
              <div style={{ fontWeight: 600 }}>{r.meta.title || "Sin título"}</div>
              {r.meta.description && (
                <div style={{ color: "#444", whiteSpace: "pre-wrap" }}>{r.meta.description}</div>
              )}
              <div style={{ marginTop: 6, fontSize: 12 }}>
                <Badge>Sentimiento: {r.ai.sentiment}</Badge>
                <Badge>Postura: {r.ai.stance}</Badge>
                <Badge>Tema: {r.ai.topic}</Badge>
              </div>
              {r.ai.entities?.length > 0 && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  <b>Entidades:</b> {r.ai.entities.join(", ")}
                </div>
              )}
              <div style={{ marginTop: 6 }}>
                <b>Resumen IA:</b> {r.ai.summary}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
import React from "react";

function Pill({ children }) {
  return (
    <span
      style={{
        border: "1px solid #ddd",
        borderRadius: 999,
        padding: "2px 8px",
        marginRight: 6,
        fontSize: 12,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

export default function ResultsView({
  politicianName,
  results,
  sentimentSummary,
  getBadgeVariant,   // puedes ignorar si no lo usas
  formatDate,        // idem
  onNewAnalysis,
  onDownloadPdf,
  resultsRef,
}) {
  const list = results?.results ?? [];

  return (
    <div className="space-y-6" ref={resultsRef}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold">Resultados del análisis</h2>
          <div className="text-sm text-gray-600">
            {politicianName ? <>Personaje: <b>{politicianName}</b> · </> : null}
            {list.length} publicaciones analizadas
          </div>
          {sentimentSummary?.total ? (
            <div className="text-sm text-gray-700 mt-1">
              <b>Conteo</b> — 👍 {sentimentSummary.sentiments?.positive || 0} · 😐 {sentimentSummary.sentiments?.neutral || 0} · 👎 {sentimentSummary.sentiments?.negative || 0}
              {sentimentSummary.predominant ? <> · <b>Predomina:</b> {sentimentSummary.predominant}</> : null}
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button onClick={onNewAnalysis} className="px-3 py-2 border rounded">
            Nuevo análisis
          </button>
          <button onClick={onDownloadPdf} className="px-3 py-2 border rounded">
            Descargar PDF
          </button>
        </div>
      </div>

      {list.length === 0 && (
        <div className="text-gray-600 text-sm">
          No hay elementos para mostrar. Revisa la consola del navegador (Network → <i>analyze-json</i>) para confirmar que llega el JSON.
        </div>
      )}

      <div className="space-y-4">
        {list.map((r, idx) => {
          if (!r) return null;

          // Fallbacks de seguridad
          const platform = r.meta?.platform ?? "unknown";
          const url = r.meta?.url ?? "#";
          const published = r.meta?.published_at ? (formatDate ? formatDate(r.meta.published_at) : r.meta.published_at) : null;

          // Muchos OG devuelven title/description; si no hay caption, usamos description
          const caption = r.meta?.caption ?? r.meta?.description ?? "";
          const title = r.meta?.title ?? (caption ? "" : "Sin título");

          const sentiment = (r.ai?.sentiment ?? "—").toLowerCase();
          const stance = (r.ai?.stance ?? "—").toLowerCase();
          const topic = r.ai?.topic ?? "—";
          const entities = Array.isArray(r.ai?.entities) ? r.ai.entities : [];

          return (
            <div
              key={idx}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Pill>{platform.toUpperCase()}</Pill>
                {published ? <span>{published}</span> : null}
                <a href={url} target="_blank" rel="noreferrer" className="underline">
                  Ver publicación
                </a>
              </div>

              <div className="mt-1 font-semibold">{title}</div>

              {caption ? (
                <div className="mt-1 text-gray-800 whitespace-pre-wrap">
                  {caption}
                </div>
              ) : null}

              <div className="mt-2 text-sm">
                <Pill>Sentimiento: {sentiment}</Pill>
                <Pill>Postura: {stance}</Pill>
                <Pill>Tema: {topic}</Pill>
              </div>

              {entities.length > 0 && (
                <div className="mt-2 text-sm">
                  <b>Entidades:</b> {entities.join(", ")}
                </div>
              )}

              {r.ai?.summary ? (
                <div className="mt-2">
                  <b>Resumen IA:</b> {r.ai.summary}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

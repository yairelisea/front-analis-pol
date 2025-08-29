import React from 'react';
import { Eye, Download, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

function Pill({ children }) {
  return (
    <span
      style={{
        border: '1px solid #ddd',
        borderRadius: 999,
        padding: '2px 8px',
        marginRight: 6,
        fontSize: 12,
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  );
}

function numberMapFromResults(results, fieldPathFn) {
  return results.reduce((acc, r) => {
    const key = fieldPathFn(r) || 'none';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

const ResultsView = ({
  politicianName,
  results = [],
  summary = null,
  getBadgeVariant,
  formatDate,
  onNewAnalysis,
  onDownloadPdf,
  resultsRef
}) => {
  // Derivar resumen si backend no lo proporcionó
  const computed = React.useMemo(() => {
    const total = results.length;
    const sentiments = summary?.sentiments ?? results.reduce((acc, r) => {
      const s = (r.ai?.sentiment || 'unknown').toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const predominant = summary?.predominant ?? Object.entries(sentiments).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const stances = summary?.stances ?? numberMapFromResults(results, r => (r.ai?.stance || 'none').toLowerCase());
    const topEntities = summary?.top_entities ?? (() => {
      const m = {};
      for (const r of results) {
        const ents = Array.isArray(r.ai?.entities) ? r.ai.entities : [];
        for (const e of ents) {
          m[e] = (m[e] || 0) + 1;
        }
      }
      return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
    })();

    return { total, sentiments, predominant, stances, topEntities };
  }, [results, summary]);

  return (
    <div className="space-y-8">
      <Card className="glass-effect border-gray-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-foreground">
              Análisis para: <span className="text-[#1acc8d]">{politicianName}</span>
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={onNewAnalysis} variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
                <FilePlus className="mr-2 h-4 w-4" />
                Nuevo Análisis
              </Button>
              <Button onClick={() => resultsRef?.current?.scrollIntoView({ behavior: 'smooth' })}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Resultados
              </Button>
              <Button onClick={onDownloadPdf} className="bg-[#1acc8d] hover:bg-emerald-700">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div ref={resultsRef} className="space-y-6">
        {/* Resumen ejecutivo */}
        <Card className="p-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Resumen ejecutivo</h3>
            <div className="text-sm text-gray-700 mb-2">
              <b>Total de publicaciones:</b> {computed.total}
              {computed.predominant ? <> · <b>Sentimiento predominante:</b> {computed.predominant}</> : null}
            </div>

            <div className="text-sm text-gray-600 mb-2">
              <b>Distribución de sentimientos:</b>{' '}
              {Object.entries(computed.sentiments).map(([k, v]) => (
                <span key={k} style={{ marginRight: 8 }}><Pill>{k}: {v}</Pill></span>
              ))}
            </div>

            <div className="text-sm text-gray-600 mb-2">
              <b>Posturas:</b>{' '}
              {Object.entries(computed.stances).map(([k, v]) => (
                <span key={k} style={{ marginRight: 8 }}><Pill>{k}: {v}</Pill></span>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              <b>Top entidades:</b> {computed.topEntities && computed.topEntities.length ? computed.topEntities.join(', ') : '—'}
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-semibold">Publicaciones analizadas</h2>
            <div className="text-sm text-gray-600">
              {politicianName ? <>Personaje: <b>{politicianName}</b> · </> : null}
              {results.length} publicaciones analizadas
            </div>
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

        {results.length === 0 && (
          <div className="text-gray-600 text-sm">
            No hay elementos para mostrar. Revisa la consola del navegador (Network → <i>analyze-json</i>) para confirmar que llega el JSON.
          </div>
        )}

        <div className="space-y-4">
          {results.map((r, idx) => {
            if (!r) return null;

            const platform = r.meta?.platform ?? 'unknown';
            const url = r.meta?.url ?? '#';
            const published = r.meta?.published_at ? (formatDate ? formatDate(r.meta.published_at) : r.meta.published_at) : null;
            const handle = r.meta?.author_handle ?? r.meta?.handle ?? r.meta?.author_name ?? null;

            const caption = r.meta?.caption ?? r.meta?.description ?? '';
            const title = r.meta?.title ?? (caption ? '' : 'Sin título');

            const sentiment = (r.ai?.sentiment ?? '—').toLowerCase();
            const toxicity = r.ai?.toxicity ?? null;
            const stance = (r.ai?.stance ?? '—').toLowerCase();
            const topic = r.ai?.topic ?? '—';
            const subtopics = Array.isArray(r.ai?.subtopics) ? r.ai.subtopics : (r.ai?.subtopic ? [r.ai.subtopic] : []);
            const entities = Array.isArray(r.ai?.entities) ? r.ai.entities : [];
            const opportunities = r.ai?.opportunities ?? r.ai?.opportunity ?? null;
            const riskNote = r.ai?.risk_note ?? r.ai?.note_of_risk ?? null;

            return (
              <div
                key={idx}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Pill>{platform.toUpperCase()}</Pill>
                  {published ? <span>{published}</span> : null}
                  {handle ? <span className="text-sm text-gray-500">@{handle}</span> : null}
                  <a href={url} target="_blank" rel="noreferrer" className="underline ml-auto">
                    Ver publicación
                  </a>
                </div>

                <div className="mt-1 font-semibold">{title}</div>

                {caption ? (
                  <div className="mt-1 text-gray-800 whitespace-pre-wrap">
                    {caption}
                  </div>
                ) : null}

                {r.ai?.summary ? (
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <b>Resumen IA:</b>
                    <div className="mt-1 text-sm text-gray-800">{r.ai.summary}</div>
                  </div>
                ) : null}
                
                {summary?.short_text ? (
  <p className="text-gray-700 mt-2 leading-relaxed">{summary.short_text}</p>
) : null}  

                <div className="mt-2 text-sm">
                  <Pill>Sentimiento: {sentiment}</Pill>
                  <Pill>Toxicidad: {typeof toxicity !== 'undefined' && toxicity !== null ? String(toxicity) : '—'}</Pill>
                  <Pill>Postura: {stance}</Pill>
                  <Pill>Tema: {topic}</Pill>
                </div>

                {subtopics.length > 0 && (
                  <div className="mt-2 text-sm">
                    <b>Subtemas:</b> {subtopics.join(', ')}
                  </div>
                )}

                {entities.length > 0 && (
                  <div className="mt-2 text-sm">
                    <b>Entidades:</b> {entities.join(', ')}
                  </div>
                )}

                {opportunities ? (
                  <div className="mt-2 text-sm">
                    <b>Oportunidades:</b> {Array.isArray(opportunities) ? opportunities.join(', ') : opportunities}
                  </div>
                ) : null}

                {riskNote ? (
                  <div className="mt-2 text-sm text-rose-700">
                    <b>Nota de riesgo:</b> {riskNote}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
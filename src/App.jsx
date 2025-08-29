// src/App.jsx
import { useState } from "react";
import Results from "./components/Results";
import { processUrls, analyzeJSON, downloadPDF } from "./lib/api";

export default function App() {
  const [name, setName] = useState("");
  const [office, setOffice] = useState("");
  const [urlText, setUrlText] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  function handleChangeUrls(v) {
    setUrlText(v);
    setCount(processUrls(v).length);
  }

  async function onPreview(e) {
    e.preventDefault();
    setError("");
    const urls = processUrls(urlText);
    if (urls.length < 25) {
      setError(`Debes proporcionar al menos 25 URLs. Actual: ${urls.length}`);
      return;
    }
    setLoading(true);
    try {
      const resp = await analyzeJSON({ name, office, urls });
      setData(resp);
    } catch (err) {
      setError(err.message || "Error al analizar");
    } finally {
      setLoading(false);
    }
  }

  async function onDownload(e) {
    e.preventDefault();
    setError("");
    const urls = processUrls(urlText);
    if (urls.length < 25) {
      setError(`Debes proporcionar al menos 25 URLs. Actual: ${urls.length}`);
      return;
    }
    setLoading(true);
    try {
      await downloadPDF({ name, office, urls });
    } catch (err) {
      setError(err.message || "Error al generar PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Percepción Digital — Analizador</h1>

      <form>
        <div>
          <label>Nombre del personaje</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Cargo / aspiración (opcional)</label>
          <input
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>URLs (una por línea)</label>
          <textarea
            value={urlText}
            onChange={(e) => handleChangeUrls(e.target.value)}
            placeholder={`https://www.tiktok.com/@user/video/12345
https://www.instagram.com/p/ABC123/
https://x.com/user/status/6789
https://elpais.com/...`}
            rows={10}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 12, color: count >= 25 ? "green" : "crimson" }}>
            {count} de 25 mínimo
          </div>
        </div>

        {error && (
          <div style={{ color: "crimson", margin: "8px 0" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button disabled={loading} onClick={onPreview}>
            {loading ? "Analizando…" : "Ver análisis (JSON)"}
          </button>
          <button disabled={loading} onClick={onDownload} type="button">
            {loading ? "Generando…" : "Descargar PDF"}
          </button>
        </div>
      </form>

      <Results data={data} />
    </main>
  );
}
import { API_BASE, MIN_URLS } from './config';
// src/lib/api.js
import { API_BASE } from "../config";

export function processUrls(text) {
  return text
    .split(/\n|,|;/)
    .map(u => u.trim())
    .filter(Boolean)
    .map(u => (u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`));
}

export async function analyzeJSON({ name, office, urls }) {
  const res = await fetch(`${API_BASE}/analyze-chunk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ politician: { name, office }, urls }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Error ${res.status}`);
  }
  return res.json(); // { politician, results: [...] }
}

export async function downloadPDF({ name, office, urls }) {
  const res = await fetch(`${API_BASE}/analyze-chunk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ politician: { name, office }, urls }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Error ${res.status}`);
  }
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `percepcion_${name.replace(/\s+/g, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(href);
}

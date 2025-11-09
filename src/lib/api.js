// src/lib/api.js

export function processUrls(text) {
  return text
    .split(/\n|,|;/)
    .map(u => u.trim())
    .filter(Boolean)
    .map(u => (u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`));
}

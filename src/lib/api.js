// src/lib/api.js
import { API_BASE } from '../config';

export function processUrls(text) {
  return text
    .split(/\n|,|;/)
    .map(u => u.trim())
    .filter(Boolean)
    .map(u => (u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`));
}

/**
 * Fetches a list of all available analyses.
 * @returns {Promise<Array>} A promise that resolves to an array of analyses.
 */
export const getAnalyses = async () => {
  const response = await fetch(`${API_BASE}/analyses`);
  if (!response.ok) {
    throw new Error('Failed to fetch analyses');
  }
  return response.json();
};

/**
 * Fetches a single analysis by its ID.
 * @param {string} id The ID of the analysis to fetch.
 * @returns {Promise<Object>} A promise that resolves to the analysis object.
 */
export const getAnalysisById = async (id) => {
  const response = await fetch(`${API_BASE}/analysis/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analysis with id ${id}`);
  }
  return response.json();
};

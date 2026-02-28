/**
 * Plant.id v3 API integration — species identification + health assessment
 * Replaces Pl@ntNet with a more accurate crop identification engine.
 *
 * In dev mode, uses Vite proxy with API key sent directly.
 * In production, proxies through Vercel serverless functions with Supabase JWT auth.
 */

import { supabase } from "./supabase";

// Only used in dev mode (Vite proxy)
const PLANTID_API_KEY = import.meta.env.VITE_PLANTID_API_KEY;

export function isPlantIdConfigured() {
  // In prod, always configured (serverless function has the key)
  // In dev, needs the VITE_ env var
  if (!import.meta.env.DEV) return true;
  return Boolean(PLANTID_API_KEY);
}

/**
 * Convert an image File to a base64 data-URI string (no prefix).
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // strip the "data:image/...;base64," prefix
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get the current Supabase session token for authenticating with serverless functions.
 */
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Identify a plant species AND assess its health in one call.
 * Returns a rich result object with species info, health status, and diseases.
 */
export async function identifyPlant(imageFile) {
  const base64Image = await fileToBase64(imageFile);

  const body = JSON.stringify({
    images: [base64Image],
    // Request health assessment alongside identification
    health: "all",
    similar_images: true,
  });

  let url;
  const headers = { "Content-Type": "application/json" };

  if (import.meta.env.DEV) {
    // Dev: use Vite proxy to avoid CORS, send API key directly
    url = `/plantid-api/v3/identification?details=common_names,description,taxonomy,treatment&language=en`;
    headers["Api-Key"] = PLANTID_API_KEY;
  } else {
    // Prod: use Vercel serverless function with JWT auth
    url = "/api/identify";
    const token = await getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Plant.id error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // --- Parse species identification ---
  const suggestions = data.result?.classification?.suggestions || [];
  if (suggestions.length === 0) {
    throw new Error("No plant species identified. Try a clearer photo.");
  }

  const top = suggestions[0];
  const commonNames = top.details?.common_names || [];
  const commonName = commonNames[0] || top.name;

  // --- Parse health assessment ---
  const isHealthy = data.result?.is_healthy?.binary ?? null;
  const healthProbability = data.result?.is_healthy?.probability ?? null;
  const diseases = (data.result?.disease?.suggestions || [])
    .filter((d) => d.probability > 0.1)
    .map((d) => ({
      name: d.name,
      probability: d.probability,
      description: d.details?.description || null,
      treatment: {
        chemical:
          d.details?.treatment?.chemical || [],
        biological:
          d.details?.treatment?.biological || [],
        prevention:
          d.details?.treatment?.prevention || [],
      },
    }));

  return {
    // Species info
    species: top.name,
    scientificName: top.name,
    commonName,
    commonNames,
    family:
      top.details?.taxonomy?.family || "Unknown",
    genus: top.details?.taxonomy?.genus || "",
    confidence: top.probability,
    description: top.details?.description?.value || null,

    // Health info
    isHealthy,
    healthProbability,
    diseases,

    // Raw for debugging
    rawSuggestions: suggestions.slice(0, 5),
  };
}

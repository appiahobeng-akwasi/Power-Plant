const PLANTNET_API_KEY = import.meta.env.VITE_PLANTNET_API_KEY;

export function isPlantNetConfigured() {
  return Boolean(PLANTNET_API_KEY);
}

export async function identifyPlant(imageFile) {
  const formData = new FormData();
  formData.append("images", imageFile);
  formData.append("organs", "auto");

  // Dev: Vite proxy   |   Prod: Vercel serverless function
  let url;
  if (import.meta.env.DEV) {
    url = `/plantnet-api/v2/identify/all?api-key=${PLANTNET_API_KEY}&lang=en`;
  } else {
    url = "/api/plantnet";
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pl@ntNet error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No plant species identified. Try a clearer photo.");
  }

  const top = data.results[0];
  return {
    species: top.species.scientificNameWithoutAuthor,
    scientificName: top.species.scientificName,
    commonName:
      top.species.commonNames?.[0] ||
      top.species.scientificNameWithoutAuthor,
    family:
      top.species.family?.scientificNameWithoutAuthor || "Unknown",
    confidence: top.score,
    rawResults: data.results.slice(0, 3),
  };
}

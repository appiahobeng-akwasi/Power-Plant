// Vercel serverless function — proxies Plant.id API to avoid CORS

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // base64 images can be large
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.VITE_PLANTID_API_KEY;
  if (!apiKey) {
    console.error("VITE_PLANTID_API_KEY is not set");
    return res.status(500).json({ error: "Plant.id API key not configured" });
  }

  try {
    // req.body is already parsed JSON by Vercel's bodyParser
    const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    // Plant.id v3 — identification with health assessment
    const url = "https://plant.id/api/v3/identification?details=common_names,description,taxonomy,treatment&language=en";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: bodyStr,
    });

    const data = await response.text();

    res
      .status(response.status)
      .setHeader("Content-Type", "application/json")
      .send(data);
  } catch (err) {
    console.error("Plant.id proxy error:", err);
    res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
}

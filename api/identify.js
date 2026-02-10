// Vercel serverless function — proxies Plant.id API to avoid CORS
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.VITE_PLANTID_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Plant.id API key not configured" });
  }

  try {
    const contentType = req.headers["content-type"] || "application/json";

    // Plant.id v3 — identification with health assessment
    const url = "https://plant.id/api/v3/identification?details=common_names,description,taxonomy,treatment&language=en";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "Api-Key": apiKey,
      },
      body: req.body,
      duplex: "half",
    });

    const data = await response.text();
    res
      .status(response.status)
      .setHeader("Content-Type", "application/json")
      .send(data);
  } catch (err) {
    console.error("Plant.id proxy error:", err);
    res.status(500).json({ error: "Proxy request failed" });
  }
}

export const config = {
  api: {
    bodyParser: false, // pass raw body through
  },
};

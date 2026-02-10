// Vercel serverless function — proxies Plant.id health assessment API

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
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
    const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    // Plant.id v3 — health assessment with treatment details
    const url = "https://plant.id/api/v3/health_assessment?details=description,treatment&language=en";

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
    console.error("Plant.id health proxy error:", err);
    res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
}

// Vercel serverless function — proxies Pl@ntNet API to avoid CORS
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.VITE_PLANTNET_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Pl@ntNet API key not configured" });
  }

  try {
    // Forward the raw body as-is to Pl@ntNet
    const contentType = req.headers["content-type"] || "";
    const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&lang=en`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: req.body,
      duplex: "half",
    });

    const data = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json").send(data);
  } catch (err) {
    console.error("Pl@ntNet proxy error:", err);
    res.status(500).json({ error: "Proxy request failed" });
  }
}

export const config = {
  api: {
    bodyParser: false, // pass raw multipart body through
  },
};

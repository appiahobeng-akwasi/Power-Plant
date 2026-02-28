// Vercel serverless function — proxies Plant.id API to avoid CORS
import { createClient } from "@supabase/supabase-js";

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

  // ── Auth: verify Supabase JWT ──
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // ── Validate request body ──
  const body = req.body;
  if (!body || !body.images || !Array.isArray(body.images) || body.images.length === 0) {
    return res.status(400).json({ error: "Request must include a non-empty images array" });
  }
  if (body.images.length > 5) {
    return res.status(400).json({ error: "Maximum 5 images allowed per request" });
  }

  const apiKey = process.env.PLANTID_API_KEY;
  if (!apiKey) {
    console.error("PLANTID_API_KEY is not set");
    return res.status(500).json({ error: "Plant.id API key not configured" });
  }

  try {
    const bodyStr = typeof body === "string" ? body : JSON.stringify(body);

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
    res.status(500).json({ error: "Proxy request failed" });
  }
}

export default async function handler(req, res) {
  // CORS headers lazmi hain taake Lovable block na kare
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Please use POST." });
  }

  const { apiUrl, apiKey } = req.body || {};

  if (!apiUrl || !apiKey) {
    return res.status(400).json({ error: "apiUrl and apiKey are required" });
  }

  try {
    // SMM Panels require Form Data (URLSearchParams)
    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("action", "services");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Provider API returned ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch from provider" });
  }
}

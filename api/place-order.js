export default async function handler(req, res) {
  // CORS Headers taake frontend block na ho
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS request handle karna
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Sirf POST request allow karna
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Please use POST." });
  }

  // Frontend se data nikalna
  const { apiUrl, apiKey, service, link, quantity } = req.body || {};

  // Check karna ke koi field missing toh nahi
  if (!apiUrl || !apiKey || !service || !link || !quantity) {
    return res.status(400).json({ 
      error: "Missing required fields (apiUrl, apiKey, service, link, quantity)" 
    });
  }

  try {
    // SMM Panel Provider ko 'x-www-form-urlencoded' format mein data bhejna
    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("action", "add"); // order lagane ka action
    formData.append("service", service);
    formData.append("link", link);
    formData.append("quantity", quantity);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json();
    
    // Agar provider API error de
    if (data.error) {
       return res.status(400).json({ error: data.error });
    }

    // Success hone par response wapas frontend ko bhejna
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to place order at provider" });
  }
}

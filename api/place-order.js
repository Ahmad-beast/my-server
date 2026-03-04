export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { apiUrl, apiKey, service, link, quantity } = req.body || {};

  // FIX: More robust validation
  // Old code: !service would fail for service=0 (though 0 is invalid anyway)
  // Now we check each field explicitly with a clear error message per field
  if (!apiUrl || typeof apiUrl !== "string") {
    return res.status(400).json({ error: "Missing or invalid field: apiUrl" });
  }
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ error: "Missing or invalid field: apiKey" });
  }
  if (!service) {
    return res.status(400).json({ error: "Missing or invalid field: service (providerServiceId)" });
  }
  if (!link || typeof link !== "string") {
    return res.status(400).json({ error: "Missing or invalid field: link" });
  }
  if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
    return res.status(400).json({ error: "Missing or invalid field: quantity (must be a positive number)" });
  }

  try {
    // Send to SMM provider in x-www-form-urlencoded format
    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("action", "add");
    formData.append("service", String(service));      // Explicit String conversion
    formData.append("link", link);
    formData.append("quantity", String(quantity));    // Explicit String conversion

    console.log(`[place-order] Calling provider: ${apiUrl} | service: ${service} | qty: ${quantity}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    // FIX: Handle non-JSON responses from providers gracefully
    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Some providers return plain text or HTML on error
      const text = await response.text();
      console.error(`[place-order] Non-JSON response from provider: ${text}`);
      return res.status(502).json({ error: `Provider returned unexpected response: ${text.slice(0, 200)}` });
    }

    if (data.error) {
      console.error(`[place-order] Provider error: ${data.error}`);
      return res.status(400).json({ error: data.error });
    }

    console.log(`[place-order] Success. Provider order ID: ${data.order}`);
    return res.status(200).json(data);

  } catch (err) {
    console.error(`[place-order] Exception:`, err);
    return res.status(500).json({ error: err.message || "Failed to reach provider API" });
  }
}

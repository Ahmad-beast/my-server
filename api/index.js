const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors()); // CORS problem solved!
app.use(express.json());

// API Proxy Route
app.post("/api/proxy", async (req, res) => {
    try {
        const { url } = req.body; 
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong!" });
    }
});

module.exports = app;
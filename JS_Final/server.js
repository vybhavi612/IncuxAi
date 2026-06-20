const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;
const API_KEY = "602bf41165fc3b185368a48ef231572d";

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/weather", async (req, res) => {
    const city = req.query.city;
    
    if (!city) {
        return res.status(400).json({ error: "City parameters are required." });
    }

    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
            return res.status(404).json({ error: "Could not fetch weather data." });
        }

        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal server runtime execution fault." });
    }
});

app.listen(PORT, () => {
    console.log(`Server executing seamlessly on port ${PORT}`);
});
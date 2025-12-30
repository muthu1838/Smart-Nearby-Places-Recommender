import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const moodTags = {
  work: "cafe",
  date: "restaurant",
  quick: "fast_food",
  budget: "food"
};

router.get("/", async (req, res) => {
  const { lat, lon, mood } = req.query;
  const tag = moodTags[mood] || "restaurant";

  // 2000 meters radius
  const query = `
    [out:json];
    node
      ["amenity"="${tag}"]
      (around:2000, ${lat}, ${lon});
    out;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });

    const data = await response.json();
    res.json(data.elements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nearby places" });
  }
});

export default router;

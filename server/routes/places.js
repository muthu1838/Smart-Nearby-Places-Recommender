import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  const { lat, lon, mood } = req.query;

  let queryFilter = "";

  switch (mood) {
    case "school":
      queryFilter = `[amenity~"school|college|university"]`;
      break;

    case "food":
      queryFilter = `[amenity~"restaurant|cafe|fast_food"]`;
      break;

    case "hospital":
      queryFilter = `[amenity~"hospital|clinic"]`;
      break;

    case "theatre":
      queryFilter = `[amenity~"theatre|cinema"]`;
      break;

    default:
      queryFilter = `[amenity~"school|college|university|restaurant|cafe|fast_food|hospital|clinic|theatre|cinema"]`;
  }

  const query = `
    [out:json];
    node
      (around:2000, ${lat}, ${lon})
      ${queryFilter};
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

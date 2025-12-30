import express from "express";
import cors from "cors";
import placesRoute from "./routes/places.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/places", placesRoute);

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);

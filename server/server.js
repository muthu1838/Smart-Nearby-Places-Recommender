import express from "express";
import cors from "cors";
import placesRoute from "./routes/places.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/places", placesRoute);

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () =>
    console.log("✅ Server running on http://localhost:5000")
  );
}

export default app;

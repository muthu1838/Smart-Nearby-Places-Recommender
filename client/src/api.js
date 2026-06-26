export async function fetchPlaces(lat, lon, mood) {
  const url = `/api/places?lat=${lat}&lon=${lon}&mood=${mood || ""}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch places:", err);
    return [];
  }
}

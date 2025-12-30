export async function fetchPlaces(lat, lon, mood) {
  let query = "";

  switch (mood) {
    case "school":
      query = `[amenity~"school|college|university"]`;
      break;

    case "food":
      query = `[amenity~"restaurant|cafe|fast_food"]`;
      break;

    case "hospital":
      query = `[amenity~"hospital|clinic"]`;
      break;

    case "theatre":
      query = `[amenity~"theatre|cinema"]`;
      break;

    // 👉 Show ALL main places if no mood selected
    default:
      query = `[amenity~"school|college|university|restaurant|cafe|fast_food|hospital|clinic|theatre|cinema"]`;
  }

  const url = `https://overpass-api.de/api/interpreter?data=
    [out:json];
    node(around:2000,${lat},${lon})${query};
    out;
  `;

  const res = await fetch(url);
  const data = await res.json();
  return data.elements;
}

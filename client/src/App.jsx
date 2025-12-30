import { useEffect, useState } from "react";
import MapView from "./components/MapView";
import PlaceCard from "./components/PlaceCard";
import LocationInput from "./components/LocationInput";
import MoodSelector from "./components/MoodSelector";
import { fetchPlaces } from "./api";
import "./App.css";

export default function App() {
  const [location, setLocation] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mood, setMood] = useState(null);
  const [maxDistance, setMaxDistance] = useState(5);
  const [darkMode, setDarkMode] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [directions, setDirections] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  // Handle new typed location
  const handleLocationSelect = (loc) => {
    setLocation(loc);

    // Reset everything when a new location is selected
    setSelectedPlace(null);
    setDirections([]);
    setRouteInfo(null);
  };

  // Load places when location changes
  useEffect(() => {
    if (!location) return;

    setLoading(true);

    fetchPlaces(location.lat, location.lon, null)
      .then((data) => {
        const withDistance = data.map((p) => ({
          ...p,
          distance: haversineDistance(location.lat, location.lon, p.lat, p.lon),
        }));

        withDistance.sort((a, b) => a.distance - b.distance);

        setAllPlaces(withDistance);
        setPlaces(withDistance.slice(0, 10));
      })
      .finally(() => setLoading(false));

    // Reset route + selection
    setSelectedPlace(null);
    setDirections([]);
    setRouteInfo(null);

  }, [location?.lat, location?.lon]);   // <-- IMPORTANT FIX

  // Filter by mood
  useEffect(() => {
    if (!mood) {
      setPlaces(allPlaces.slice(0, 10));
      return;
    }

    const filtered = allPlaces.filter((p) => {
      const tag = p.tags?.amenity || "";

      if (mood === "school") return /school|college|university/i.test(tag);
      if (mood === "food") return /restaurant|cafe|fast_food/i.test(tag);
      if (mood === "hospital") return /hospital|clinic/i.test(tag);
      if (mood === "theatre") return /cinema|theatre/i.test(tag);

      return true;
    });

    setPlaces(filtered.slice(0, 10));
  }, [mood, allPlaces]);

  // Apply max distance filter
  const filteredPlaces = places.filter((p) => p.distance <= maxDistance);

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <header className="top-bar">
        <div className="brand">
          <div className="logo">M</div>
          <span className="brand-name">M-Explore</span>
        </div>
      </header>

      <div className="container">
        <h2 className="page-title">
          {!mood && "Explore Nearby Places"}
          {mood === "school" && "Best Places for Students"}
          {mood === "food" && "Top Food Spots Near You"}
          {mood === "hospital" && "Nearby Hospitals"}
          {mood === "theatre" && "Nearby Theatre & Cinemas"}
        </h2>

        <LocationInput onLocationSelect={handleLocationSelect} />
        <MoodSelector mood={mood} setMood={setMood} />

        <div className="layout">
          <div className="list">
            {filteredPlaces.map((p) => (
              <PlaceCard
                key={p.id}
                place={p}
                onClick={() => {
                  setSelectedPlace(p);
                  setDirections([]);
                  setRouteInfo(null);
                }}
                isSelected={selectedPlace?.id === p.id}
                directions={directions}
                routeInfo={routeInfo}
              />
            ))}
          </div>

          {location && filteredPlaces.length > 0 && (
            <MapView
              places={filteredPlaces}
              userLocation={location}
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              setDirections={setDirections}
              setRouteInfo={setRouteInfo}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Haversine distance
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

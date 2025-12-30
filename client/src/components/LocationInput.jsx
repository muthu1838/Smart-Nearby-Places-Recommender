import { useState } from "react";

export default function LocationInput({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Search by query
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "M-Explore-App"
        }
      });

      const data = await res.json();

      if (!data || data.length === 0) {
        alert("Location not found. Try a clearer address.");
        return;
      }

      const place = data[0];

      onLocationSelect({
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        name: place.display_name
      });

      // ❌ Don't clear the input to allow edits
      // setQuery("");

    } catch (err) {
      console.error("Geocoding Error:", err);
      alert("Failed to fetch location.");
    } finally {
      setLoading(false);
    }
  };

  // Use browser's geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode to get a readable name
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, {
            headers: {
              "User-Agent": "M-Explore-App"
            }
          });

          const data = await res.json();
          const displayName = data.display_name || "Current Location";

          onLocationSelect({
            lat: latitude,
            lon: longitude,
            name: displayName
          });

          setQuery(displayName);
        } catch (err) {
          console.error("Reverse Geocoding Error:", err);
          alert("Failed to get your location name.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation Error:", err);
        alert("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="location-input">
      <input
        type="text"
        placeholder="Enter Door No, Street, Area, City"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Find"}
      </button>

      <button onClick={handleUseMyLocation} disabled={loading}>
        {loading ? "Locating..." : "Use My Location"}
      </button>
    </div>
  );
}

export default function PlaceCard({
  place,
  onClick,
  isSelected,
  directions,
  routeInfo
}) {
  return (
    <div
      className={`place-card ${isSelected ? "active" : ""}`}
      onClick={onClick}
    >
      <h3>{place.tags?.name || "Unnamed place"}</h3>

      <p>
        {place.tags?.amenity ||
          place.tags?.tourism ||
          place.tags?.historic ||
          "Place"}
      </p>

      <small>{place.distance.toFixed(2)} km away</small>

      {isSelected && routeInfo && (
        <div className="eta">
          🚗 {routeInfo.duration} mins • {routeInfo.distance} km
        </div>
      )}

      {isSelected && directions?.length > 0 && (
        <div className="directions-box">
          <h4>Directions</h4>

          {directions.map((d, i) => (
            <p
              key={i}
              className={`direction-step ${i === 1 ? "highlight" : ""}`}
            >
              {i + 1}. {d.text} ({Math.round(d.distance)} m)
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

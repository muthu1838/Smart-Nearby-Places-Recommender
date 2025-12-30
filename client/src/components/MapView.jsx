import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMap
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const { BaseLayer, Overlay } = LayersControl;

/* ICONS */
const userIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const selectedIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const placeIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

/* FIX MAP RESIZE */
function FixResize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
}

/* FLY TO USER WHEN LOCATION CHANGES */
function FlyToUser({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location)
      map.flyTo([location.lat, location.lon], 15, { duration: 1.3 });
  }, [location, map]);
  return null;
}

/* FLY TO SELECTED PLACE */
function FlyToPlace({ place }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.lat, place.lon], 16, { duration: 1.2 });
  }, [place, map]);
  return null;
}

/* ROUTE + INSTRUCTIONS + VOICE */
function RoutePath({ from, to, setDirections, setRouteInfo }) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    speechSynthesis.cancel(); // stop old voice

    const router = L.Routing.osrmv1({
      profile: "driving",
      serviceUrl: "https://router.project-osrm.org/route/v1",
    });

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(from.lat, from.lon),
        L.latLng(to.lat, to.lon),
      ],
      router,
      lineOptions: {
        styles: [
          { color: "#ff2e2e", weight: 7, opacity: 1 },
          { color: "#ffffff", weight: 2, opacity: 1 },
        ],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
    })
      .on("routesfound", (e) => {
        const route = e.routes[0];

        const instructions = route.instructions.map((s) => ({
          text: s.text,
          distance: s.distance,
        }));
        setDirections(instructions);

        setRouteInfo({
          distance: (route.summary.totalDistance / 1000).toFixed(1),
          duration: Math.round(route.summary.totalTime / 60),
        });

        instructions.forEach((step, i) => {
          setTimeout(() => {
            const speak = new SpeechSynthesisUtterance(step.text);
            speechSynthesis.speak(speak);
          }, i * 2500);
        });
      })
      .addTo(map);

    return () => {
      map.removeControl(routingControl);
      speechSynthesis.cancel();
    };
  }, [from, to, map]);

  return null;
}

/* PULSING USER */
function PulsingCircle({ position }) {
  const map = useMap();
  useEffect(() => {
    const circle = L.circleMarker([position.lat, position.lon], {
      radius: 12,
      color: "#1a73e8",
      fillColor: "#1a73e8",
      fillOpacity: 0.3,
      weight: 2,
    }).addTo(map);

    return () => map.removeLayer(circle);
  }, [position, map]);
  return null;
}

/* MAIN MAP VIEW */
export default function MapView({
  places,
  userLocation,
  selectedPlace,
  setSelectedPlace,
  setDirections,
  setRouteInfo,
}) {
  return (
    <div className="map-wrapper">
      <MapContainer
        center={[userLocation.lat, userLocation.lon]}
        zoom={15}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Street">
            <TileLayer
              attribution="OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri"
            />
          </BaseLayer>

          <Overlay checked name="Labels">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              zIndex={999}
            />
          </Overlay>

          <Overlay checked name="Road Names">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
              zIndex={999}
            />
          </Overlay>
        </LayersControl>

        {/* USER */}
        <Marker
          position={[userLocation.lat, userLocation.lon]}
          icon={userIcon}
        />
        <PulsingCircle position={userLocation} />

        {/* AUTO FLY WHEN USER LOCATION CHANGES */}
        <FlyToUser location={userLocation} />

        {/* PLACES */}
        {places.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lon]}
            icon={selectedPlace?.id === p.id ? selectedIcon : placeIcon}
            eventHandlers={{ click: () => setSelectedPlace(p) }}
          />
        ))}

        {/* ROUTE */}
        <FlyToPlace place={selectedPlace} />
        <RoutePath
          from={userLocation}
          to={selectedPlace}
          setDirections={setDirections}
          setRouteInfo={setRouteInfo}
        />

        <FixResize />
      </MapContainer>
    </div>
  );
}

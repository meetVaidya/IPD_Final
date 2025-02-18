"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

// Fix marker icon issues common with Leaflet in React:
import L from "leaflet";
if ("_getIconUrl" in L.Icon.Default.prototype) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
}
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

interface MarkerType {
    lat: number;
    lng: number;
}

interface MapSelectorProps {
    onChange: (markers: MarkerType[]) => void;
}

export default function MapSelector({ onChange }: MapSelectorProps) {
    const [markers, setMarkers] = useState<MarkerType[]>([]);

    // Component for handling map clicks.
    function LocationMarker() {
        useMapEvents({
            click(e) {
                if (markers.length < 4) {
                    const newMarkers = [...markers, e.latlng];
                    setMarkers(newMarkers);
                    onChange(newMarkers);
                } else {
                    alert("You can only select 4 locations.");
                }
            },
        });
        return null;
    }

    return (
        <div>
            <p>Click on the map to add up to 4 locations.</p>
            <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "300px", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((position, idx) => (
                    <Marker key={idx} position={[position.lat, position.lng]} />
                ))}
                <LocationMarker />
            </MapContainer>
        </div>
    );
}

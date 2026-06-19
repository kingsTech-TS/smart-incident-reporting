
"use client";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issues
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Custom incident icon
const incidentIcon = L.divIcon({
  className: "custom-div-icon",
  html: '<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Custom responder icon
const responderIcon = L.divIcon({
  className: "custom-div-icon",
  html: '<div style="background-color: #06b6d4; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(6, 182, 212, 0.7);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

interface MapControllerProps {
  responderLocation: { lat: number; lng: number } | null;
}

const MapController = ({ responderLocation }: MapControllerProps) => {
  const map = useMap();
  useEffect(() => {
    if (responderLocation) {
      map.setView([responderLocation.lat, responderLocation.lng], 15);
    }
  }, [map, responderLocation]);
  return null;
};

interface ResponderMapProps {
  incidentLat: number;
  incidentLng: number;
  className?: string;
}

export default function ResponderMap({
  incidentLat,
  incidentLng,
  className = "",
}: ResponderMapProps) {
  const [responderLocation, setResponderLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setResponderLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  return (
    <div className={className}>
      <MapContainer
        center={[incidentLat, incidentLng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[incidentLat, incidentLng]} icon={incidentIcon}>
          <Popup>Incident Location</Popup>
        </Marker>
        {responderLocation && (
          <Marker
            position={[responderLocation.lat, responderLocation.lng]}
            icon={responderIcon}
          >
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        <MapController responderLocation={responderLocation} />
      </MapContainer>
    </div>
  );
}

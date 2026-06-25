"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";

/* ─── Directions renderer – lives inside <Map> ─────────────────────────── */
interface DirectionsProps {
  origin: google.maps.LatLngLiteral | null;
  destination: google.maps.LatLngLiteral;
  onDuration: (text: string) => void;
  onDistance: (text: string) => void;
}

function Directions({ origin, destination, onDuration, onDistance }: DirectionsProps) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  // Initialise service + renderer once the library is ready
  useEffect(() => {
    if (!routesLib || !map) return;
    const service = new routesLib.DirectionsService();
    const renderer = new routesLib.DirectionsRenderer({
      suppressMarkers: true, // we draw our own markers
      polylineOptions: {
        strokeColor: "#06b6d4",
        strokeWeight: 5,
        strokeOpacity: 0.85,
      },
    });
    renderer.setMap(map);
    setDirectionsService(service);
    setDirectionsRenderer(renderer);
    return () => renderer.setMap(null);
  }, [routesLib, map]);

  // Request route whenever origin/destination changes
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin) return;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg?.duration?.text) onDuration(leg.duration.text);
          if (leg?.distance?.text) onDistance(leg.distance.text);
        }
      }
    );
  }, [directionsService, directionsRenderer, origin, destination]);

  return null;
}

/* ─── Main component ────────────────────────────────────────────────────── */
interface ResponderMapProps {
  incidentLat: number;
  incidentLng: number;
  className?: string;
}

export default function ResponderMap({ incidentLat, incidentLng, className = "" }: ResponderMapProps) {
  const [responderLocation, setResponderLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [duration, setDuration] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  // Cast coordinates to Number to prevent string concatenation/NaN bugs
  const safeIncidentLat = Number(incidentLat);
  const safeIncidentLng = Number(incidentLng);
  const incident: google.maps.LatLngLiteral = { lat: safeIncidentLat, lng: safeIncidentLng };

  // Get responder GPS automatically
  useEffect(() => {
    if (!navigator.geolocation) { setLocationLoaded(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setResponderLocation({ 
          lat: Number(pos.coords.latitude), 
          lng: Number(pos.coords.longitude) 
        });
        setLocationLoaded(true);
      },
      () => setLocationLoaded(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // URL to open Google Maps with turn-by-turn directions
  const googleMapsUrl = responderLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${responderLocation.lat},${responderLocation.lng}&destination=${safeIncidentLat},${safeIncidentLng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${safeIncidentLat},${safeIncidentLng}&travelmode=driving`;

  if (!locationLoaded) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 animate-pulse rounded-lg ${className}`}>
        <span className="text-slate-400 text-sm">Locating you…</span>
      </div>
    );
  }

  // Centre between responder & incident for best overview, or just the incident
  const mapCenter = responderLocation
    ? {
        lat: (Number(responderLocation.lat) + safeIncidentLat) / 2,
        lng: (Number(responderLocation.lng) + safeIncidentLng) / 2,
      }
    : incident;

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {/* Directions info strip */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-t-lg bg-slate-900 border border-slate-700 border-b-0">
        <div className="flex items-center gap-4 text-sm">
          {duration && (
            <span className="flex items-center gap-1.5 text-white font-semibold">
              🕐 {duration}
            </span>
          )}
          {distance && (
            <span className="flex items-center gap-1.5 text-slate-400">
              📍 {distance} away
            </span>
          )}
          {!duration && !responderLocation && (
            <span className="text-slate-500 text-xs">Location unavailable — showing incident only</span>
          )}
          {!duration && responderLocation && (
            <span className="text-slate-500 text-xs animate-pulse">Calculating route…</span>
          )}
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shrink-0"
        >
          <span>🧭</span> Get Directions
        </a>
      </div>

      {/* Map */}
      <div
        style={{ flex: 1, minHeight: 0, height: "100%" }}
        className="rounded-b-lg overflow-hidden border border-slate-700"
      >
        <APIProvider apiKey={apiKey}>
          <div style={{ width: "100%", height: "100%" }}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={responderLocation ? 13 : 15}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapId="responder-map"
              style={{ height: "100%", width: "100%" }}
            >
              {/* Route overlay */}
              <Directions
                origin={responderLocation}
                destination={incident}
                onDuration={setDuration}
                onDistance={setDistance}
              />

              {/* Incident marker — red pin */}
              <AdvancedMarker position={incident} title="Incident Location" zIndex={5}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "#ef4444",
                  border: "3px solid white",
                  boxShadow: "0 0 0 4px rgba(239,68,68,0.35), 0 4px 12px rgba(0,0,0,0.4)",
                }} />
              </AdvancedMarker>

              {/* Responder marker — cyan pulse */}
              {responderLocation && (
                <AdvancedMarker position={responderLocation} title="Your Location" zIndex={10}>
                  <div style={{ position: "relative", width: 24, height: 24 }}>
                    {/* Pulse ring */}
                    <div style={{
                      position: "absolute", inset: -6, borderRadius: "50%",
                      background: "rgba(6,182,212,0.2)",
                      animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                    }} />
                    <div style={{
                      position: "relative", width: 24, height: 24, borderRadius: "50%",
                      background: "#06b6d4",
                      border: "3px solid white",
                      boxShadow: "0 0 0 3px rgba(6,182,212,0.35)",
                    }} />
                  </div>
                </AdvancedMarker>
              )}
            </Map>
          </div>
        </APIProvider>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} /> Incident
        </span>
        {responderLocation && (
          <span className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#06b6d4", display: "inline-block" }} /> You
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span style={{ width: 18, height: 3, background: "#06b6d4", display: "inline-block", borderRadius: 2 }} /> Route
        </span>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

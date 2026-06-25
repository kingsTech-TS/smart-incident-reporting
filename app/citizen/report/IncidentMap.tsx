'use client';
import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

interface IncidentMapProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    const safeLat = Number(lat);
    const safeLng = Number(lng);
    if (map && !isNaN(safeLat) && !isNaN(safeLng)) {
      map.panTo({ lat: safeLat, lng: safeLng });
    }
  }, [map, lat, lng]);
  return null;
}

export default function IncidentMap({ selectedLocation, onLocationChange, className = '' }: IncidentMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);

  useEffect(() => {
    if (navigator.geolocation && !selectedLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude);
          const lng = Number(position.coords.longitude);
          setUserLocation({ lat, lng });
          setLocationLoaded(true);
          // Automatically select the user's location
          onLocationChange(lat, lng);
        },
        () => {
          setLocationLoaded(true);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocationLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!locationLoaded && !selectedLocation) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 animate-pulse rounded-lg ${className}`}>
        <span className="text-slate-400">Locating...</span>
      </div>
    );
  }

  const defaultLat = selectedLocation ? Number(selectedLocation.lat) : (userLocation ? Number(userLocation.lat) : 51.505);
  const defaultLng = selectedLocation ? Number(selectedLocation.lng) : (userLocation ? Number(userLocation.lng) : -0.09);
  const position = { lat: defaultLat, lng: defaultLng };

  return (
    <div className={className}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={position}
          defaultZoom={15}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="citizen-incident-map"
          onClick={(e) => {
            if (e.detail.latLng) {
              const clickedLat = Number(e.detail.latLng.lat);
              const clickedLng = Number(e.detail.latLng.lng);
              onLocationChange(clickedLat, clickedLng);
            }
          }}
          style={{ height: '100%', width: '100%' }}
        >
          <MapRecenter lat={position.lat} lng={position.lng} />

          {selectedLocation && (
            <AdvancedMarker position={{ lat: Number(selectedLocation.lat), lng: Number(selectedLocation.lng) }} title="Selected Location">
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#ef4444',
                border: '3px solid white',
                boxShadow: '0 0 0 3px rgba(239,68,68,0.35), 0 2px 8px rgba(0,0,0,0.4)',
              }} />
            </AdvancedMarker>
          )}

          {!selectedLocation && userLocation && (
            <AdvancedMarker position={{ lat: Number(userLocation.lat), lng: Number(userLocation.lng) }} title="Your Location">
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#06b6d4',
                border: '3px solid white',
                boxShadow: '0 0 0 3px rgba(6,182,212,0.35), 0 2px 8px rgba(0,0,0,0.4)',
              }} />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}


'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issues
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapClickHandlerProps {
  onLocationChange: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationChange }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface IncidentMapProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function IncidentMap({ selectedLocation, onLocationChange, className = '' }: IncidentMapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={selectedLocation || [51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectedLocation && <Marker position={selectedLocation} />}
        <MapClickHandler onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}

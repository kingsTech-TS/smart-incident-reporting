'use client';
import React from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface IncidentMapProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export default function IncidentMap({ latitude, longitude, className = '' }: IncidentMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const safeLat = Number(latitude);
  const safeLng = Number(longitude);
  const position = { lat: safeLat, lng: safeLng };

  return (
    <div className={className}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={position}
          defaultZoom={15}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="admin-incident-map"
          style={{ height: '100%', width: '100%' }}
        >
          <AdvancedMarker position={position} title="Incident Location">
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: '#ef4444',
              border: '3px solid white',
              boxShadow: '0 0 0 3px rgba(239,68,68,0.35), 0 2px 8px rgba(0,0,0,0.4)',
            }} />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}


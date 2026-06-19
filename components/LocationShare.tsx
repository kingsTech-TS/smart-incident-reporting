'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/components/WebSocketProvider';
import { LocateFixed, LocateOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function LocationShare() {
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.accessToken);
  const watchIdRef = useRef<number | null>(null);
  const { sendMessage } = useWebSocket();

  const startSharing = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setError(null);
    setIsSharing(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        
        // Send location via WebSocket
        if (sendMessage) {
          sendMessage({
            type: 'responder_location',
            location: newLocation,
          });
        }
        
        // Also send via API periodically (as backup)
        if (token) {
          api.responders.shareLocation(token, { 
            latitude: newLocation.lat, 
            longitude: newLocation.lng 
          }).catch(err => {
            console.error('Failed to share location via API:', err);
          });
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
        setIsSharing(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000, // 5 seconds
        timeout: 10000,  // 10 seconds
      }
    );

    watchIdRef.current = watchId;
  };

  const stopSharing = () => {
    setIsSharing(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {isSharing && location && (
        <p className="text-slate-400 text-sm hidden md:block">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}
      <Button
        variant={isSharing ? 'destructive' : 'secondary'}
        size="sm"
        onClick={isSharing ? stopSharing : startSharing}
        className={isSharing ? 'border-red-500/30' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}
      >
        {isSharing ? (
          <><LocateOff className="h-4 w-4 mr-2" /> Stop Sharing</>
        ) : (
          <><LocateFixed className="h-4 w-4 mr-2" /> Share Location</>
        )}
      </Button>
    </div>
  );
}

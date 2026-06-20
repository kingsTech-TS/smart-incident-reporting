'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';

interface WebSocketContextType {
  isConnected: boolean;
  messages: any[];
  lastMessage: any;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const token = useAuthStore((state) => state.accessToken);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (!token) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // Derive WebSocket URL from API base URL if not set
    let wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsBaseUrl) {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://smart-incident-reporting-db.onrender.com';
      wsBaseUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    }

    const wsUrl = `${wsBaseUrl}/ws/${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        setLastMessage(data);
        setMessages((prev) => [...prev, data]);

        // Auto-add notification from WebSocket message
        if (data.type === 'notification' || data.title || data.message) {
          const notification = {
            id: data.id || Date.now().toString(),
            title: data.title || 'Update',
            message: data.message || data.body || 'New update',
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          addNotification(notification);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      // Don't throw, just log it
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [token, addNotification]);

  const sendMessage = (message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, messages, lastMessage, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

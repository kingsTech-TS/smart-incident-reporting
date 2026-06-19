'use client';
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Bell, Check, Trash2, Clock } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export default function CitizenNotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, addNotification } = useNotificationStore();
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!token) return;
        const data = await api.notifications.get(token);
        data.forEach((n: any) => {
          addNotification({
            id: n.id,
            title: n.title,
            message: n.message,
            isRead: n.is_read,
            createdAt: n.created_at,
          });
        });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifications();
  }, [token, addNotification]);

  const handleMarkAsRead = async (id: string) => {
    try {
      if (!token) return;
      await api.notifications.markRead(token, id);
      markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        subtitle={`You have ${unreadCount} unread notifications`}
      />
      <div className="px-8 pb-8">
        <div className="flex gap-4 mb-6">
          <Button
            variant="secondary"
            onClick={markAllAsRead}
            className="bg-slate-800 hover:bg-slate-700 border-slate-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
          <Button
            variant="secondary"
            onClick={clearAll}
            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <Card className="border-slate-700/50 bg-[#0b1220]">
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.isRead
                        ? 'border-slate-700 bg-slate-900/30'
                        : 'border-cyan-500/30 bg-cyan-500/5'
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{notification.title}</h4>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">{notification.message}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

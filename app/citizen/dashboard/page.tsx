'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { AlertTriangle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/components/WebSocketProvider';

export default function CitizenDashboardPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const { lastMessage } = useWebSocket();

  const fetchData = async () => {
    try {
      if (token) {
        const data = await api.incidents.get(token);
        setIncidents(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    // Refresh data when WebSocket message is received
    if (lastMessage) {
      fetchData();
    }
  }, [lastMessage]);

  const total = incidents.length;
  const inProgress = incidents.filter(i => i.status === 'in_progress').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;

  const stats = [
    { title: 'Total Reports', value: total.toString(), icon: AlertTriangle, color: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
    { title: 'In Progress', value: inProgress.toString(), icon: Clock, color: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { title: 'Resolved', value: resolved.toString(), icon: CheckCircle2, color: 'bg-gradient-to-br from-green-500 to-emerald-600' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="My Dashboard"
        subtitle="View and manage your incident reports"
      />
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-slate-700/50 bg-[#0b1220]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-700/50 bg-[#0b1220]">
          <CardHeader>
            <CardTitle className="text-xl">My Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-slate-800 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Severity</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No incidents reported yet
                        </td>
                      </tr>
                    ) : (
                      incidents.map((incident) => (
                        <tr key={incident.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4 text-sm font-mono text-cyan-400">{incident.id}</td>
                          <td className="py-4 px-4 text-sm font-medium text-white">{incident.title}</td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                              {incident.category}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {incident.created_at ? new Date(incident.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
                              onClick={() => router.push(`/citizen/incidents/${incident.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

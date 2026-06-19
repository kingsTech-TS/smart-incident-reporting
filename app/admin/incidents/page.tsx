'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { AlertTriangle, Clock, Eye, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export default function AdminIncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        if (!token) return;
        const data = await api.incidents.get(token);
        setIncidents(data);
      } catch (err) {
        console.error('Failed to fetch incidents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, [token]);

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
        title="All Incidents"
        subtitle="Manage and monitor all reported incidents"
      />
      <div className="px-4 sm:px-8 pb-4 sm:pb-8">
        <Card className="border-slate-700/50 bg-[#0b1220]">
          <CardHeader>
            <CardTitle className="text-xl">Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-800 rounded"></div>
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
                    {incidents.map((incident) => (
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
                          {new Date(incident.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                            onClick={() => router.push(`/admin/incidents/${incident.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {!incident.assigned_to && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
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

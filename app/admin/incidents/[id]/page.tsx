'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { MapPin, Clock, User, ArrowLeft, UserPlus, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import ImageLightbox from '../../../../components/ImageLightbox';

const IncidentMap = dynamic(() => import('../IncidentMap'), { ssr: false });

export default function AdminIncidentDetailsPage() {

  const params = useParams();
  const router = useRouter();
  const [incident, setIncident] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [selectedResponder, setSelectedResponder] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchError(null);
        if (!token || !params.id) return;
        const [incidentData, usersData] = await Promise.all([
          api.incidents.getById(token, params.id as string),
          api.users.get(token),
        ]);
        setIncident(incidentData);
        setUsers(usersData.filter((u: any) => u.role === 'responder'));
      } catch (err: any) {
        setFetchError(err.message || 'Failed to load incident details');
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, params.id]);

  const handleAssign = async () => {
    if (!selectedResponder) return;
    try {
      setAssignError(null);
      if (!token || !params.id) return;
      setAssigning(true);
      const updatedIncident = await api.incidents.assign(token, params.id as string, selectedResponder);
      const assignedUser = users.find(u => u.id === selectedResponder);
      setIncident(updatedIncident || { ...incident, assigned_to: assignedUser });
    } catch (err: any) {
      setAssignError(err.message || 'Failed to assign incident');
      console.error('Failed to assign incident:', err);
    } finally {
      setAssigning(false);
    }
  };

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

  const getTimelineItems = () => {
    const items = [];
    
    // Always add the reported event
    items.push({
      type: 'reported',
      message: 'Incident Reported',
      user: incident?.reported_by?.full_name || 'Citizen',
      timestamp: incident?.created_at,
    });

    // Add timeline from backend if available
    if (incident?.timeline) {
      items.push(...incident.timeline);
    }

    // Add assignment if available
    if (incident?.assigned_to) {
      items.push({
        type: 'assigned',
        message: `Incident Assigned`,
        user: incident?.assigned_by?.full_name || 'Admin',
        timestamp: incident?.assigned_at || incident?.updated_at,
        assigned_to: typeof incident.assigned_to === 'object' ? incident.assigned_to.full_name : users.find(u => u.id === incident.assigned_to)?.full_name,
      });
    }

    // Sort by timestamp
    return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-8 pb-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-slate-800 rounded mb-4"></div>
            <div className="h-4 w-48 bg-slate-800 rounded mb-8"></div>
            <div className="h-64 bg-slate-800 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (fetchError) {
    return (
      <DashboardLayout>
        <div className="px-8 pb-8 text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-400">{fetchError}</p>
            <Button variant="secondary" onClick={() => window.location.reload()} className="bg-slate-800 hover:bg-slate-700 border-slate-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!incident) {
    return (
      <DashboardLayout>
        <div className="px-8 pb-8 text-center py-12">
          <p className="text-slate-400">Incident not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const assignedUser = typeof incident.assigned_to === 'object' ? incident.assigned_to : users.find((u) => u.id === incident.assigned_to);
  const timelineItems = getTimelineItems();

  return (
    <DashboardLayout>
      <PageHeader
        title="Incident Details"
        subtitle={`Viewing incident #${incident.id}`}
      />
      <div className="px-8 pb-8">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="mb-6 bg-slate-800 hover:bg-slate-700 border-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-700/50 bg-[#0b1220]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{incident.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Reported on {new Date(incident.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-white mb-2">Description</h4>
                  <p className="text-slate-400">{incident.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{incident.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="h-4 w-4" />
                    <span>Category: {incident.category}</span>
                  </div>
                </div>

                {incident.media && incident.media.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Media</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {incident.media.map((item: any, index: number) => (
                        <div
                          key={index}
                          className={`aspect-square bg-slate-800 rounded-lg overflow-hidden ${item.resource_type === 'image' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                          onClick={() => {
                            if (item.resource_type === 'image') {
                              const imageItems = incident.media.filter((m: any) => m.resource_type === 'image');
                              const imgIndex = imageItems.findIndex((img: any) => img === item);
                              setCurrentImageIndex(imgIndex);
                              setLightboxOpen(true);
                            }
                          }}
                        >
                          {item.resource_type === 'image' ? (
                            <img
                              src={item.url}
                              alt={`Incident media ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={item.url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {incident.latitude && incident.longitude && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Location</h4>
                    <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-700">
                      <IncidentMap
                        latitude={incident.latitude}
                        longitude={incident.longitude}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-700">
                  <h4 className="font-medium text-white mb-4">Assigned To</h4>
                  {assignedUser ? (
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {assignedUser.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{assignedUser.full_name}</p>
                        <p className="text-xs text-slate-400">{assignedUser.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assignError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {assignError}
                        </div>
                      )}
                      <div className="flex gap-4">
                        <Select
                          value={selectedResponder || ''}
                          onValueChange={setSelectedResponder}
                          disabled={assigning}
                        >
                          <SelectTrigger className="bg-slate-900/50 border-slate-700 w-64">
                            <SelectValue placeholder="Select responder" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700">
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id} disabled={!user.is_online}>
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                  {user.full_name}
                                  {!user.is_online && <span className="text-xs text-slate-500">(Offline)</span>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
                          disabled={assigning || !selectedResponder}
                          onClick={handleAssign}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {assigning ? 'Assigning...' : 'Assign'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-700/50 bg-[#0b1220]">
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timelineItems.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                          {item.type === 'reported' ? (
                            <MapPin className="h-4 w-4" />
                          ) : item.type === 'assigned' ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        {index < timelineItems.length - 1 && (
                          <div className="w-0.5 flex-1 bg-slate-700 my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm text-white font-medium">
                          {item.message}
                          {item.assigned_to && (
                            <span className="text-slate-400 font-normal"> to {item.assigned_to}</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.user} • {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {lightboxOpen && (
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={incident.media.filter((m: any) => m.resource_type === 'image').map((img: any, idx: number) => ({ url: img.url, alt: `Incident image ${idx + 1}` }))}
          currentIndex={currentImageIndex}
          onNavigate={(idx: number) => setCurrentImageIndex(idx)}
        />
      )}
    </DashboardLayout>
  );
}

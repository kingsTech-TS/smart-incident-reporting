'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { MapPin, Clock, User, ArrowLeft, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import ImageLightbox from '../../../../components/ImageLightbox';

const IncidentMap = dynamic(() => import('../../../admin/incidents/IncidentMap'), { ssr: false });

export default function CitizenIncidentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        if (!token || !params.id) return;
        const data = await api.incidents.getById(token, params.id as string);
        setIncident(data);
      } catch (err) {
        console.error('Failed to fetch incident:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
  }, [token, params.id]);

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
        assigned_to: incident?.assigned_to?.full_name,
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

  if (!incident) {
    return (
      <DashboardLayout>
        <div className="px-8 pb-8 text-center py-12">
          <p className="text-slate-400">Incident not found</p>
        </div>
      </DashboardLayout>
    );
  }

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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {incident.assigned_to && incident.assigned_to.full_name && (
              <Card className="border-slate-700/50 bg-[#0b1220]">
                <CardHeader>
                  <CardTitle>Assigned Responder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {incident.assigned_to.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{incident.assigned_to.full_name}</p>
                      {incident.assigned_to.email && <p className="text-slate-400 text-sm">{incident.assigned_to.email}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

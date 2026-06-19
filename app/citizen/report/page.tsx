'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { MapPin, Upload, AlertCircle, LocateFixed } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';

// Component that contains the map with click handler
const IncidentMap = dynamic(() => import('./IncidentMap'), { ssr: false });

export default function ReportIncidentPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationOption, setLocationOption] = useState<'map' | 'address'>('map');
  const [media, setMedia] = useState<{ url: string; public_id: string; resource_type: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Error getting location:', err);
        }
      );
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!token) return;

    setUploadingMedia(true);
    const files = Array.from(e.target.files);
    
    try {
      for (const file of files) {
        const signedUrl = await api.media.getSignedUpload(token);
        // Upload file to the signed URL (simplified, adjust based on actual backend)
        const formData = new FormData();
        formData.append('file', file);
        
        // For demo, we'll just use a placeholder
        // In real implementation, you'd upload to Cloudinary or your backend
        const reader = new FileReader();
        reader.onloadend = () => {
          setMedia(prev => [...prev, {
            url: reader.result as string,
            public_id: `temp-${Date.now()}`,
            resource_type: file.type.startsWith('video') ? 'video' : 'image'
          }]);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error uploading media:', err);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!token) throw new Error('Not authenticated');
      if (locationOption === 'map' && !selectedLocation) throw new Error('Please select a location on the map');
      
      const incidentData: any = {
        title,
        description,
        category,
        severity,
        address,
        media,
      };

      if (locationOption === 'map' && selectedLocation) {
        incidentData.latitude = selectedLocation.lat;
        incidentData.longitude = selectedLocation.lng;
      }

      console.log('Incident Report Payload:', incidentData);
      await api.incidents.create(token, incidentData);
      router.push('/citizen/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Report Incident"
        subtitle="Create a new incident report"
      />
      <div className="px-4 sm:px-8 pb-4 sm:pb-8">
        <Card className="border-slate-700/50 bg-[#0b1220]">
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>Provide all necessary information about the incident</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-700"
                  placeholder="Brief description of the incident"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="crime">Crime</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={severity} onValueChange={setSeverity} required>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="bg-slate-900/50 border-slate-700"
                  placeholder="Detailed description of the incident"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Tabs value={locationOption} onValueChange={(v) => setLocationOption(v as any)} className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="map" className="flex-1">Interactive Map (Recommended)</TabsTrigger>
                    <TabsTrigger value="address" className="flex-1">Address Only</TabsTrigger>
                  </TabsList>
                  <TabsContent value="map" className="space-y-4">
                    <div className="h-64 sm:h-96 w-full rounded-lg overflow-hidden border border-slate-700">
                      <IncidentMap
                        selectedLocation={selectedLocation}
                        onLocationChange={(lat, lng) => setSelectedLocation({ lat, lng })}
                        className="h-full w-full"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={getCurrentLocation}
                      className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                    >
                      <LocateFixed className="h-4 w-4 mr-2" />
                      Use My Current Location
                    </Button>
                    {selectedLocation && (
                      <p className="text-sm text-slate-400">
                        Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    )}
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address (optional)"
                      className="bg-slate-900/50 border-slate-700"
                    />
                  </TabsContent>
                  <TabsContent value="address" className="space-y-4">
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter the full address"
                      className="bg-slate-900/50 border-slate-700"
                      required
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>Media (Optional)</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Drag and drop files here or click to upload</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4 bg-slate-800 hover:bg-slate-700 border-slate-700"
                    onClick={() => document.getElementById('media-upload')?.click()}
                    disabled={uploadingMedia}
                  >
                    {uploadingMedia ? 'Uploading...' : 'Select Files'}
                  </Button>
                </div>
                {media.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    {media.map((item, index) => (
                      <div key={index} className="aspect-square bg-slate-800 rounded-lg overflow-hidden relative">
                        {item.resource_type === 'image' ? (
                          <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" />
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => setMedia(prev => prev.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

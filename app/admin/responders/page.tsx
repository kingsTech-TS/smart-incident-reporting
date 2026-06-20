'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Users, Mail, Phone, Search, Clock, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/components/WebSocketProvider';
import { api } from '@/lib/api';

export default function AdminRespondersPage() {
  const [responders, setResponders] = useState<any[]>([]);
  const [filteredResponders, setFilteredResponders] = useState<any[]>([]);
  const [selectedResponderIds, setSelectedResponderIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [approvalFilter, setApprovalFilter] = useState('all'); // 'all', 'approved', 'pending'
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const { messages } = useWebSocket();

  const fetchResponders = async () => {
    setError(null);
    try {
      if (!token) return;
      const data = await api.users.get(token);
      const respondersOnly = data.filter((user: any) => user.role === 'responder');
      setResponders(respondersOnly);
      setFilteredResponders(respondersOnly);
    } catch (err: any) {
      console.error('Failed to fetch responders:', err);
      setError(err.message || 'Failed to fetch responders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch responders
  useEffect(() => {
    fetchResponders();
  }, [token]);

  // Real-time updates from WebSocket
  useEffect(() => {
    if (!messages.length) return;
    
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.type === 'responder_id') {
      setResponders(prev => prev.map(responder => 
        responder.id === latestMessage.responder_id 
          ? { ...responder, is_online: true } 
          : responder
      ));
    }
  }, [messages]);

  // Apply filters
  useEffect(() => {
    let result = [...responders];

    // Status filter
    if (statusFilter === 'online') {
      result = result.filter(r => r.is_online);
    } else if (statusFilter === 'offline') {
      result = result.filter(r => !r.is_online);
    }

    // Active filter
    if (activeFilter === 'active') {
      result = result.filter(r => r.is_active);
    } else if (activeFilter === 'inactive') {
      result = result.filter(r => !r.is_active);
    }

    // Approval filter
    if (approvalFilter === 'approved') {
      result = result.filter(r => r.is_approved === true);
    } else if (approvalFilter === 'pending') {
      result = result.filter(r => r.is_approved === false);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.full_name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        (r.phone && r.phone.includes(query))
      );
    }

    setFilteredResponders(result);
  }, [responders, statusFilter, searchQuery, activeFilter, approvalFilter]);

  const toggleResponderSelection = (id: string) => {
    setSelectedResponderIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedResponderIds.size === filteredResponders.length) {
      setSelectedResponderIds(new Set());
    } else {
      setSelectedResponderIds(new Set(filteredResponders.map(r => r.id)));
    }
  };

  const handleBulkToggleActive = async (activate: boolean) => {
    if (!window.confirm(`Are you sure you want to ${activate ? 'activate' : 'suspend'} ${selectedResponderIds.size} responder(s)?`)) return;

    const originalResponders = [...responders];
    try {
      // Optimistic update
      setResponders(prev => prev.map(r => 
        selectedResponderIds.has(r.id) ? { ...r, is_active: activate } : r
      ));
      
      // Make API calls for each selected responder
      for (const id of selectedResponderIds) {
        await api.users.updateActiveStatus(token!, id, activate);
      }
      
      // Clear selection after successful operation
      setSelectedResponderIds(new Set());
    } catch (err: any) {
      console.error('Failed to bulk update responders:', err);
      setResponders(originalResponders);
      setError(err.message || 'Failed to update responders');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedResponderIds.size} responder(s)? This action cannot be undone!`)) return;

    const originalResponders = [...responders];
    try {
      // Optimistic update
      setResponders(prev => prev.filter(r => !selectedResponderIds.has(r.id)));
      
      // Make API calls for each selected responder
      for (const id of selectedResponderIds) {
        await api.users.delete(token!, id);
      }
      
      // Clear selection after successful operation
      setSelectedResponderIds(new Set());
    } catch (err: any) {
      console.error('Failed to bulk delete responders:', err);
      setResponders(originalResponders);
      setError(err.message || 'Failed to delete responders');
    }
  };

  const handleApproveResponder = async (userId: string, approve: boolean) => {
    if (!window.confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this responder?`)) return;

    const originalResponders = [...responders];
    try {
      setResponders(prev => prev.map(r => r.id === userId ? { ...r, is_approved: approve } : r));
      await api.users.approve(token!, userId, approve);
    } catch (err: any) {
      console.error('Failed to approve responder:', err);
      setResponders(originalResponders);
      setError(err.message || 'Failed to approve responder');
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this responder?`)) return;

    const originalResponders = [...responders];
    try {
      setResponders(prev => prev.map(r => r.id === userId ? { ...r, is_active: !currentStatus } : r));
      await api.users.updateActiveStatus(token!, userId, !currentStatus);
    } catch (err: any) {
      console.error('Failed to update responder status:', err);
      setResponders(originalResponders);
      setError(err.message || 'Failed to update responder status');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone!`)) return;

    const originalResponders = [...responders];
    try {
      setResponders(prev => prev.filter(r => r.id !== userId));
      await api.users.delete(token!, userId);
    } catch (err: any) {
      console.error('Failed to delete responder:', err);
      setResponders(originalResponders);
      setError(err.message || 'Failed to delete responder');
    }
  };

  const getOnlineColor = (isOnline: boolean) => {
    return isOnline
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-slate-700/50 text-slate-400 border-slate-600/30';
  };

  const getActiveColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getApprovalColor = (isApproved: boolean) => {
    return isApproved
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const formatLastOnline = (lastOnline: string | null) => {
    if (!lastOnline) return 'Never';
    const date = new Date(lastOnline);
    return date.toLocaleString();
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Responders"
        subtitle="Manage all emergency responders"
      />
      <div className="px-4 sm:px-8 pb-4 sm:pb-8 space-y-4 sm:space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertCircle className="h-5 w-5" />
            {error}
            <Button
              variant="secondary"
              size="sm"
              className="ml-auto bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={fetchResponders}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
        
        {/* Grouped actions bar */}
        {selectedResponderIds.size > 0 && (
          <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-300">
              {selectedResponderIds.size} responder(s) selected
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkToggleActive(true)}
                className="bg-slate-800 hover:bg-slate-700 border-slate-700"
              >
                Activate Selected
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkToggleActive(false)}
                className="bg-slate-800 hover:bg-slate-700 border-slate-700"
              >
                Suspend Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900/50 border-slate-700"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-slate-700">
              <SelectValue placeholder="Filter online" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-slate-700">
              <SelectValue placeholder="Filter active" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-slate-700">
              <SelectValue placeholder="Filter approval" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-slate-700/50 bg-[#0b1220]">
          <CardHeader>
            <CardTitle className="text-xl">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Responder List
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-800 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="py-3 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedResponderIds.size === filteredResponders.length && filteredResponders.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Responder</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Approval</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Online Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Account Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Last Online</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No responders found
                        </td>
                      </tr>
                    ) : (
                      filteredResponders.map((responder) => (
                        <tr key={responder.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedResponderIds.has(responder.id)}
                              onChange={() => toggleResponderSelection(responder.id)}
                              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                  {responder.full_name.charAt(0)}
                                </div>
                                {/* Online indicator */}
                                <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b1220] ${responder.is_online ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{responder.full_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {responder.email}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {responder.phone || 'Not provided'}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getApprovalColor(responder.is_approved)}>
                              {responder.is_approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getOnlineColor(responder.is_online)}>
                              {responder.is_online ? 'Online' : 'Offline'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getActiveColor(responder.is_active)}>
                              {responder.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatLastOnline(responder.last_online)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {!responder.is_approved && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleApproveResponder(responder.id, true)}
                                    className="bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleApproveResponder(responder.id, false)}
                                    className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-400"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleToggleActive(responder.id, responder.is_active)}
                                className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                              >
                                {responder.is_active ? 'Suspend' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(responder.id, responder.full_name)}
                              >
                                Delete
                              </Button>
                            </div>
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

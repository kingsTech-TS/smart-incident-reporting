'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Users, Mail, Phone, Shield, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const { accessToken: token, user: currentUser } = useAuthStore((state) => state);

  const fetchUsers = async () => {
    setError(null);
    try {
      if (!token) return;
      const data = await api.users.get(token);
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Apply filters
  useEffect(() => {
    let result = [...users];
    
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    if (activeFilter !== 'all') {
      result = result.filter(user => (activeFilter === 'active') === user.is_active);
    }
    if (approvalFilter !== 'all') {
      result = result.filter(user => {
        if (approvalFilter === 'approved') return user.is_approved === true;
        if (approvalFilter === 'pending') return user.is_approved === false;
        return true;
      });
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query))
      );
    }

    setFilteredUsers(result);
  }, [users, roleFilter, activeFilter, approvalFilter, searchQuery]);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'unsuspend'} this user?`)) return;

    const originalUsers = [...users];
    try {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      await api.users.updateActiveStatus(token!, userId, !currentStatus);
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      setUsers(originalUsers);
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot change your own role!');
      return;
    }
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    const originalUsers = [...users];
    try {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await api.users.changeRole(token!, userId, newRole);
    } catch (err: any) {
      console.error('Failed to change user role:', err);
      setUsers(originalUsers);
      setError(err.message || 'Failed to change user role');
    }
  };

  const handleApproveUser = async (userId: string, approve: boolean) => {
    if (!window.confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this user?`)) return;

    const originalUsers = [...users];
    try {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: approve } : u));
      await api.users.approve(token!, userId, approve);
    } catch (err: any) {
      console.error('Failed to approve user:', err);
      setUsers(originalUsers);
      setError(err.message || 'Failed to approve user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone!`)) return;

    const originalUsers = [...users];
    try {
      setUsers(prev => prev.filter(u => u.id !== userId));
      await api.users.delete(token!, userId);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setUsers(originalUsers);
      setError(err.message || 'Failed to delete user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'responder': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  const getApprovalColor = (isApproved: boolean) => {
    return isApproved
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Users"
        subtitle="Manage all system users"
      />
      <div className="px-4 sm:px-8 pb-4 sm:pb-8 space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
            <Button
              variant="secondary"
              size="sm"
              className="ml-auto bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={fetchUsers}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900/50 border-slate-700"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full lg:w-40 bg-slate-900/50 border-slate-700">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="citizen">Citizen</SelectItem>
              <SelectItem value="responder">Responder</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-full lg:w-40 bg-slate-900/50 border-slate-700">
              <SelectValue placeholder="Filter active" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="w-full lg:w-40 bg-slate-900/50 border-slate-700">
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
            <CardTitle className="text-xl">All Users</CardTitle>
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Approval</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {user.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{user.full_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone || 'Not provided'}
                          </td>
                          <td className="py-4 px-4">
                            {user.id === currentUser?.id ? (
                              <Badge className={getRoleColor(user.role)}>
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role}
                              </Badge>
                            ) : (
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => handleChangeRole(user.id, newRole)}
                              >
                                <SelectTrigger className="w-32 h-8 bg-slate-900/50 border-slate-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700">
                                  <SelectItem value="citizen">Citizen</SelectItem>
                                  <SelectItem value="responder">Responder</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getApprovalColor(user.is_approved)}>
                              {user.is_approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={
                                user.is_active
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {!user.is_approved && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleApproveUser(user.id, true)}
                                    className="bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleApproveUser(user.id, false)}
                                    className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-400"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleToggleActive(user.id, user.is_active)}
                                className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                              >
                                {user.is_active ? 'Suspend' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id, user.full_name)}
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

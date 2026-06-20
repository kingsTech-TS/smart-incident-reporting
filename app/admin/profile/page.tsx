'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import ResetPassword from '@/components/ResetPassword';

export default function AdminProfilePage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <PageHeader
        title="Profile"
        subtitle="Manage your account settings"
      />
      <div className="px-4 sm:px-8 pb-4 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <Card className="border-slate-700/50 bg-[#0b1220]">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4">
                  {user?.full_name.charAt(0)}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">{user?.full_name}</h3>
                <p className="text-slate-400 capitalize">{user?.role}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{user?.phone || 'Not provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password & Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card className="border-slate-700/50 bg-[#0b1220]">
                  <CardHeader>
                    <CardTitle>Edit Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          defaultValue={user?.full_name}
                          className="bg-slate-900/50 border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user?.email}
                          className="bg-slate-900/50 border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          defaultValue={user?.phone}
                          className="bg-slate-900/50 border-slate-700"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg">
                          Save Changes
                        </Button>
                        <Button
                          variant="secondary"
                          className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <ResetPassword />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

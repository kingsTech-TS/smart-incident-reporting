'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Bell,
  Settings,
  Shield,
  Users,
  UserRound,
  TrendingUp,
  LogOut,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import LocationShare from './LocationShare';
import { useSidebar } from './DashboardLayout';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const navItems = {
    citizen: [
      { name: 'Dashboard', href: '/citizen/dashboard', icon: LayoutDashboard },
      { name: 'Report Incident', href: '/citizen/report', icon: Plus },
      { name: 'Notifications', href: '/citizen/notifications', icon: Bell },
      { name: 'Profile', href: '/citizen/profile', icon: Settings },
    ],
    responder: [
      { name: 'Dashboard', href: '/responder/dashboard', icon: LayoutDashboard },
      { name: 'Notifications', href: '/responder/notifications', icon: Bell },
      { name: 'Profile', href: '/responder/profile', icon: Settings },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Incidents', href: '/admin/incidents', icon: AlertTriangle },
      { name: 'Responders', href: '/admin/responders', icon: UserRound },
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Profile', href: '/admin/profile', icon: Settings },
    ],
  };

  const items = user?.role ? navItems[user.role as keyof typeof navItems] : [];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const sidebarClasses = cn(
    'fixed lg:relative z-50 flex flex-col h-screen w-72 max-w-[80vw] bg-gradient-to-b from-[#0f172a] to-[#020617] border-r border-slate-800 p-4 transition-transform duration-300 ease-in-out',
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'
  );

  return (
    <>
      <div className={sidebarClasses}>
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white">SmartOps</span>
            <span className="text-xs text-slate-400 capitalize">{user?.role || 'User'}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => toggleSidebar()}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 rounded-xl py-4 px-3 sm:py-6 sm:px-4 transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          {user?.role === 'responder' && (
            <div className="mb-4">
              <LocationShare />
            </div>
          )}
          {user && (
            <div className="mb-4 flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                {user.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.full_name}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl py-2 px-4 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

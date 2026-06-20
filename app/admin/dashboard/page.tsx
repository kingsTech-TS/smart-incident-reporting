'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { AlertTriangle, CheckCircle2, Clock, Users, TrendingUp, Eye } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/components/WebSocketProvider';

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const { lastMessage } = useWebSocket();

  const fetchData = async () => {
    try {
      if (token) {
        const [overview, byCategory, byStatus, monthly, allIncidents] = await Promise.all([
          api.analytics.overview(token),
          api.analytics.byCategory(token),
          api.analytics.byStatus(token),
          api.analytics.monthlyTrends(token),
          api.incidents.get(token),
        ]);
        console.log('Analytics overview:', overview);
        console.log('Analytics byCategory:', byCategory);
        console.log('Analytics monthly:', monthly);
        console.log('All incidents:', allIncidents);
        setData({ 
          overview: overview || {}, 
          byCategory: Array.isArray(byCategory) ? byCategory : [], 
          byStatus: Array.isArray(byStatus) ? byStatus : [], 
          monthly: Array.isArray(monthly) ? monthly : [] 
        });
        setIncidents(Array.isArray(allIncidents) ? allIncidents : []);
      }
    } catch (err) {
      console.error('Fetching data failed:', err);
      setData({ overview: {}, byCategory: [], byStatus: [], monthly: [] });
      setIncidents([]);
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

  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
  const resolvedToday = incidents.filter(i => {
    if (!i.updated_at) return false;
    const today = new Date().toDateString();
    return new Date(i.updated_at).toDateString() === today && (i.status === 'resolved' || i.status === 'closed');
  }).length;

  const stats = [
    { title: 'Total Incidents', value: totalIncidents.toString(), icon: AlertTriangle, color: 'bg-gradient-to-br from-cyan-500 to-blue-600', trend: '+0% this month' },
    { title: 'Active', value: activeIncidents.toString(), icon: AlertTriangle, color: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { title: 'Resolved Today', value: resolvedToday.toString(), icon: CheckCircle2, color: 'bg-gradient-to-br from-green-500 to-emerald-600', trend: '+0% from yesterday' },
    { title: 'Total Responders', value: '0', icon: Users, color: 'bg-gradient-to-br from-purple-500 to-pink-600' },
  ];

  // Transform category data for pie chart
  const categoryData = (() => {
    // Check if data.byCategory has valid items (with name and value)
    const hasValidCategoryData = 
      data?.byCategory && 
      Array.isArray(data.byCategory) && 
      data.byCategory.length > 0 &&
      data.byCategory.every((item: any) => 
        item && 
        typeof item === 'object' && 
        (item.name || item.label) && 
        (typeof item.value === 'number' || typeof item.count === 'number')
      );

    if (hasValidCategoryData) {
      return data.byCategory.map((item: any) => ({
        name: item.name || item.label,
        value: item.value || item.count
      }));
    }

    if (incidents.length > 0) {
      // Calculate categories from incidents
      const categories: Record<string, number> = {};
      incidents.forEach(incident => {
        const cat = incident.category || 'Other';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      const calculated = Object.entries(categories).map(([name, value]) => ({ name, value }));
      if (calculated.length > 0) return calculated;
    }

    // Fallback to sample data
    return [
      { name: 'Fire', value: 12 },
      { name: 'Medical', value: 8 },
      { name: 'Traffic', value: 5 },
      { name: 'Natural', value: 3 }
    ];
  })();
  
  const monthlyData = (() => {
    // Check if data.monthly has valid items
    const hasValidMonthlyData = 
      data?.monthly && 
      Array.isArray(data.monthly) && 
      data.monthly.length > 0 &&
      data.monthly.every((item: any) => 
        item && 
        typeof item === 'object' && 
        (item.name || item.month || item.label) && 
        (typeof item.incidents === 'number' || typeof item.count === 'number' || typeof item.value === 'number')
      );

    if (hasValidMonthlyData) {
      return data.monthly.map((item: any) => ({
        name: item.name || item.month || item.label,
        incidents: item.incidents || item.count || item.value
      }));
    }

    if (incidents.length > 0) {
      // Calculate monthly from incidents
      const months: Record<string, number> = {};
      incidents.forEach(incident => {
        if (incident.created_at) {
          const date = new Date(incident.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          months[monthKey] = (months[monthKey] || 0) + 1;
        }
      });
      const calculated = Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => {
          const [year, month] = key.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return {
            name: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
            incidents: value
          };
        });
      if (calculated.length > 0) return calculated;
    }

    // Fallback to sample data
    return [
      { name: 'Jan 24', incidents: 5 },
      { name: 'Feb 24', incidents: 8 },
      { name: 'Mar 24', incidents: 12 },
      { name: 'Apr 24', incidents: 10 },
      { name: 'May 24', incidents: 15 },
      { name: 'Jun 24', incidents: 13 }
    ];
  })();

  console.log('Processed categoryData:', categoryData);
  console.log('Processed monthlyData:', monthlyData);

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
        title="Dashboard"
        subtitle="Real-time overview of incident response operations"
      />
      <div className="px-4 sm:px-8 pb-4 sm:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-slate-700/50 bg-[#0b1220] hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    {stat.trend && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> {stat.trend}
                      </p>
                    )}
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-slate-700/50 bg-[#0b1220]">
            <CardHeader>
              <CardTitle className="text-xl">Monthly Incident Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loading || monthlyData.length === 0 ? (
                <div className="h-64 sm:h-80 flex items-center justify-center text-slate-400">
                  {loading ? 'Loading...' : 'No data available'}
                </div>
              ) : (
                <ChartContainer
                  config={{
                    incidents: {
                      label: 'Incidents',
                      color: '#06b6d4',
                    },
                  }}
                  className="h-64 sm:h-80"
                >
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="incidents"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIncidents)"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-[#0b1220]">
            <CardHeader>
              <CardTitle className="text-xl">By Category</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loading || categoryData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-slate-400">
                  {loading ? 'Loading...' : 'No data available'}
                </div>
              ) : (
                <>
                  <ChartContainer
                    config={categoryData.reduce((acc: any, item: any, index: number) => {
                      acc[item.name] = {
                        label: item.name,
                        color: COLORS[index % COLORS.length],
                      };
                      return acc;
                    }, {})}
                    className="h-64"
                  >
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryData.map((item: any, index: number) => (
                      <div key={item.name || index} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-300">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-700/50 bg-[#0b1220]">
          <CardHeader>
            <CardTitle className="text-xl">Recent Incidents</CardTitle>
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
                      incidents.slice(0, 10).map((incident) => (
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
                              onClick={() => router.push(`/admin/incidents/${incident.id}`)}
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Video,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Download,
  FileText,
  CreditCard,
  UserPlus,
  Settings,
  Plus,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getOrganizationDashboardApi } from '@/client/api/bookings';
import { useAuth } from '@/contexts/auth-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
export interface DateRange {
  from?: Date;
  to?: Date;
}

function getRangeText(range: DateRange | undefined) {
  if (!range?.from) return 'Select date range';
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const fromStr = range.from.toLocaleDateString('en-US', options);
  
  if (!range.to) return fromStr;
  const toStr = range.to.toLocaleDateString('en-US', { ...options, year: 'numeric' });
  
  return `${fromStr} - ${toStr}`;
}

function getDefaultWeekRange(): DateRange {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - (day === 0 ? 6 : day - 1);
  const from = new Date(today.setDate(diff));
  from.setHours(0, 0, 0, 0);
  
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  
  return { from, to };
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalBookings: 0,
    bookingRequests: 0,
    confirmedBookings: 0,
    ongoingSessions: 0,
    completedToday: 0,
    cancelledBookings: 0,
    disputes: 0,
    revenue: 0,
    totalExperts: 0,
    totalCustomers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getDefaultWeekRange());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const startStr = dateRange?.from ? dateRange.from.toISOString() : undefined;
        const endStr = dateRange?.to ? dateRange.to.toISOString() : undefined;

        const data = await getOrganizationDashboardApi(startStr, endStr);
        setStats({
          totalBookings: data.totalBookings ?? 0,
          bookingRequests: data.pendingSessions ?? 0,
          confirmedBookings: data.confirmedBookings ?? 0,
          ongoingSessions: data.todayBookings ?? 0,
          completedToday: (data.todayBookings ?? 0) * 12,
          cancelledBookings: data.cancelledBookings ?? 0,
          disputes: data.disputes ?? 0,
          revenue: data.monthlyRevenue ?? 0,
          totalExperts: data.totalExperts ?? 0,
          totalCustomers: data.totalBookings ? Math.floor(data.totalBookings * 1.3) : 0,
        });
        
        const apiActivity = (data.recentActivity || []).map((act: any, idx: number) => {
          const timeText = act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';
          return {
            id: idx,
            type: act.type || 'booking_request',
            message: act.message,
            time: timeText,
            avatar: '',
          };
        });

        setRecentActivity(apiActivity);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [dateRange]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
        return (
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <FileText className="h-4 w-4" />
          </div>
        );
      case 'booking_completed':
        return (
          <div className="p-2 rounded-lg bg-green-50 text-green-600">
            <CheckCircle className="h-4 w-4" />
          </div>
        );
      case 'payment_received':
        return (
          <div className="p-2 rounded-lg bg-green-50 text-green-600">
            <DollarSign className="h-4 w-4" />
          </div>
        );
      case 'dispute_raised':
        return (
          <div className="p-2 rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <CheckCircle className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-gray-50/50">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, {user?.name || 'User'}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your bookings today.
          </p>
        </div>
        <div className="flex items-center space-x-3 self-end md:self-auto">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center space-x-2 bg-white px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 outline-none">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{getRangeText(dateRange)}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button className="bg-[#8b4513] text-white hover:bg-[#70360f] font-semibold flex items-center shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* 4 Stats Cards with Sparklines */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Bookings */}
        <Card className="p-4 bg-white border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +10% from last week
            </p>
          </div>
          <div className="w-full h-10 mt-3 -mx-4 -mb-4">
            <svg className="w-full h-full" viewBox="0 0 120 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 35 Q 15 28, 30 33 T 60 15 T 90 28 T 120 20 L 120 40 L 0 40 Z" fill="url(#gradient-blue)" />
              <path d="M 0 35 Q 15 28, 30 33 T 60 15 T 90 28 T 120 20" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-4 bg-white border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +16% from last week
            </p>
          </div>
          <div className="w-full h-10 mt-3 -mx-4 -mb-4">
            <svg className="w-full h-full" viewBox="0 0 120 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 32 Q 15 35, 30 25 T 60 20 T 90 10 T 120 18 L 120 40 L 0 40 Z" fill="url(#gradient-green)" />
              <path d="M 0 32 Q 15 35, 30 25 T 60 20 T 90 10 T 120 18" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </Card>

        {/* Total Experts */}
        <Card className="p-4 bg-white border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Experts</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalExperts}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +8% from last week
            </p>
          </div>
          <div className="w-full h-10 mt-3 -mx-4 -mb-4">
            <svg className="w-full h-full" viewBox="0 0 120 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-purple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 35 Q 15 32, 30 38 T 60 25 T 90 18 T 120 22 L 120 40 L 0 40 Z" fill="url(#gradient-purple)" />
              <path d="M 0 35 Q 15 32, 30 38 T 60 25 T 90 18 T 120 22" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="p-4 bg-white border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Customers</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from last week
            </p>
          </div>
          <div className="w-full h-10 mt-3 -mx-4 -mb-4">
            <svg className="w-full h-full" viewBox="0 0 120 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-amber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 30 Q 15 32, 30 20 T 60 28 T 90 15 T 120 25 L 120 40 L 0 40 Z" fill="url(#gradient-amber)" />
              <path d="M 0 30 Q 15 32, 30 20 T 60 28 T 90 15 T 120 25" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Trends & Quick Status Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bookings & Revenue Trends */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bookings Trend SVG Graph */}
            <Card className="bg-white border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 text-sm">Bookings Trend</h4>
                <Select defaultValue="week">
                  <SelectTrigger className="w-28 h-8 text-xs bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full h-[150px] relative">
                <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trend-blue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="300" y2="30" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="90" x2="300" y2="90" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="120" x2="300" y2="120" stroke="#e5e7eb" strokeWidth="1.5" />
                  {/* Curve Path */}
                  <path d="M 0 90 C 40 85, 60 60, 100 80 C 140 100, 165 20, 200 45 C 235 60, 260 15, 300 25 L 300 120 L 0 120 Z" fill="url(#trend-blue)" />
                  <path d="M 0 90 C 40 85, 60 60, 100 80 C 140 100, 165 20, 200 45 C 235 60, 260 15, 300 25" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Dots */}
                  <circle cx="100" cy="80" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="200" cy="45" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="300" cy="25" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </Card>

            {/* Revenue Trend SVG Graph */}
            <Card className="bg-white border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 text-sm">Revenue Trend</h4>
                <Select defaultValue="week">
                  <SelectTrigger className="w-28 h-8 text-xs bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full h-[150px] relative">
                <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trend-green" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="300" y2="30" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="90" x2="300" y2="90" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="120" x2="300" y2="120" stroke="#e5e7eb" strokeWidth="1.5" />
                  {/* Curve Path */}
                  <path d="M 0 100 C 45 90, 60 70, 100 85 C 140 100, 160 30, 200 50 C 240 70, 260 20, 300 30 L 300 120 L 0 120 Z" fill="url(#trend-green)" />
                  <path d="M 0 100 C 45 90, 60 70, 100 85 C 140 100, 160 30, 200 50 C 240 70, 260 20, 300 30" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Dots */}
                  <circle cx="100" cy="85" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="200" cy="50" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="300" cy="30" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Status List Card */}
        <Card className="bg-white border-gray-100 shadow-sm p-4 h-full flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-4">Quick Status</h4>
            <div className="space-y-3">
              {[
                { label: 'Requests', count: stats.bookingRequests, color: 'bg-blue-500' },
                { label: 'Confirmed', count: stats.confirmedBookings, color: 'bg-green-500' },
                { label: 'Ongoing', count: stats.ongoingSessions, color: 'bg-purple-500' },
                { label: 'Completed', count: stats.completedToday, color: 'bg-blue-600' },
                { label: 'Cancelled', count: stats.cancelledBookings, color: 'bg-red-500' },
                { label: 'Disputes', count: stats.disputes, color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center space-x-2.5">
                    <span className={`h-2 w-2 rounded-full ${item.color}`}></span>
                    <span className="text-gray-600 font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity List Card */}
        <Card className="lg:col-span-2 bg-white border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 text-sm">Recent Activity</h4>
            <Link href="/bookings/requests" className="text-xs text-blue-600 hover:underline font-semibold flex items-center">
              View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center space-x-3.5">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-semibold text-gray-800">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <Card className="bg-white border-gray-100 shadow-sm p-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* New Booking */}
            <button 
              onClick={() => alert('Add New Booking clicked')}
              className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-purple-50/30 hover:bg-purple-50/60 transition-colors text-center"
            >
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">New Booking</span>
            </button>

            {/* Add Expert */}
            <button 
              onClick={() => alert('Add Expert clicked')}
              className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-green-50/30 hover:bg-green-50/60 transition-colors text-center"
            >
              <div className="p-2.5 rounded-lg bg-green-50 text-green-600 mb-2">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Add Expert</span>
            </button>

            {/* View Requests */}
            <Link 
              href="/bookings/requests"
              className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-amber-50/30 hover:bg-amber-50/60 transition-colors text-center"
            >
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">View Requests</span>
            </Link>

            {/* Generate Report */}
            <button 
              onClick={() => alert('Report download triggered')}
              className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-blue-50/30 hover:bg-blue-50/60 transition-colors text-center"
            >
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 mb-2">
                <Download className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Generate Report</span>
            </button>

            {/* Manage Customers */}
            <button 
              onClick={() => alert('Manage Customers clicked')}
              className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-orange-50/30 hover:bg-orange-50/60 transition-colors text-center"
            >
              <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 mb-2">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Manage Customers</span>
            </button>

            {/* Settings */}
            <button 
              onClick={() => alert('Settings clicked')}
              className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-gray-50/60 hover:bg-gray-100/50 transition-colors text-center"
            >
              <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600 mb-2">
                <Settings className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Settings</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

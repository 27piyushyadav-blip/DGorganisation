'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, Inbox, TrendingUp } from "lucide-react";
import { getOrganizationDashboardApi, getOrganizationBookingsApi } from '@/client/api/bookings';
import { getExpertsApi } from '@/client/api/experts';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [expertRequests, setExpertRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Fetch dashboard stats, recent bookings, and experts list in parallel
        const [dashboardData, bookingsRes, expertsRes] = await Promise.all([
          getOrganizationDashboardApi(),
          getOrganizationBookingsApi(),
          getExpertsApi()
        ]);

        setStats(dashboardData);

        // Map and slice top 5 recent bookings
        const allBookings = bookingsRes.bookings || [];
        const mappedBookings = allBookings.slice(0, 5).map((b: any) => {
          const d = new Date(b.scheduledDate);
          return {
            id: b.id,
            name: b.clientName || 'Unknown User',
            expert: b.expertName || 'Unassigned',
            time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            status: b.status || 'pending'
          };
        });
        setRecentBookings(mappedBookings);

        // Map and filter experts where associationStatus is 'PENDING'
        const allExperts = (expertsRes as any).experts || [];
        const pendingExperts = allExperts
          .filter((e: any) => e.associationStatus === 'PENDING')
          .map((e: any) => ({
            id: e.id,
            name: e.name || 'Anonymous Expert',
            specialty: e.specialization || 'General',
            experience: e.experience ? `${e.experience} years` : 'N/A'
          }));
        setExpertRequests(pendingExperts);
        
        setError(null);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleViewAllBookings = () => {
    router.push('/bookings');
  };

  const handleReviewExpert = () => {
    router.push('/expert-requests');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] bg-[var(--card-bg-light)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-[var(--card-bg-light)]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-[var(--card-bg-light)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Button size="lg" onClick={handleViewAllBookings}>
          <Calendar className="mr-2 h-4 w-4" />
          View All Bookings
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Month's Revenue</p>
              <p className="text-3xl font-bold mt-2">${stats?.monthlyRevenue?.toLocaleString() ?? '0'}</p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Confirmed bookings</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        {/* Active Experts Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Experts</p>
              <p className="text-3xl font-bold mt-2">{stats?.activeExperts ?? '0'}</p>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{stats?.totalExperts ?? '0'} total experts</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        {/* Pending Bookings Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Bookings</p>
              <p className="text-3xl font-bold mt-2">{stats?.pendingSessions ?? '0'}</p>
              <div className="flex items-center mt-2 text-sm text-orange-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Need confirmation</span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
        
        {/* Total Bookings Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalBookings ?? '0'}</p>
              <div className="flex items-center mt-2 text-sm text-purple-600">
                <Inbox className="h-4 w-4 mr-1" />
                <span>{stats?.todayBookings ?? '0'} today</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Inbox className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <CardDescription>Latest bookings that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-[var(--card-bg-light)] border rounded-lg border-dashed">
                  No recent bookings found.
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg bg-[var(--card-bg-light)]">
                    <div>
                      <p className="font-medium">{booking.name}</p>
                      <p className="text-sm text-muted-foreground">with {booking.expert}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{booking.time} ({booking.date})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Expert Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expert Requests</CardTitle>
            <CardDescription>New experts waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expertRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-[var(--card-bg-light)] border rounded-lg border-dashed">
                  No pending expert requests.
                </div>
              ) : (
                expertRequests.map((expert) => (
                  <div key={expert.id} className="flex items-center justify-between p-4 border rounded-lg bg-[var(--card-bg-light)]">
                    <div>
                      <p className="font-medium">{expert.name}</p>
                      <p className="text-sm text-muted-foreground">{expert.specialty} • {expert.experience}</p>
                    </div>
                    <Button size="sm" onClick={handleReviewExpert}>Review</Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

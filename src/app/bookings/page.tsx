'use client';

import { useState } from 'react';
import Link from 'next/link';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Video,
  XCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function BookingsPage() {
  // Sample data - in real app this would come from API
  const stats = {
    totalBookings: 156,
    bookingRequests: 8,
    confirmedBookings: 12,
    ongoingSessions: 3,
    completedToday: 15,
    disputes: 2,
    revenue: 12450,
    revenueChange: '+8%',
  };

  const recentActivity = [
    {
      id: 1,
      type: 'booking_request',
      user: 'Jane Smith',
      expert: 'Dr. Michael Johnson',
      time: '2 minutes ago',
      avatar: '/avatars/jane.jpg',
    },
    {
      id: 2,
      type: 'session_started',
      user: 'David Wilson',
      expert: 'Dr. Sarah Smith',
      time: '5 minutes ago',
      avatar: '/avatars/david.jpg',
    },
    {
      id: 3,
      type: 'dispute_raised',
      user: 'Emma Davis',
      expert: 'Dr. Michael Johnson',
      time: '10 minutes ago',
      avatar: '/avatars/emma.jpg',
    },
    {
      id: 4,
      type: 'booking_completed',
      user: 'Bob Johnson',
      expert: 'Dr. Emily Davis',
      time: '15 minutes ago',
      avatar: '/avatars/bob.jpg',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'session_started':
        return <Video className="h-4 w-4 text-green-500" />;
      case 'dispute_raised':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'booking_completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'booking_request':
        return `New booking request from ${activity.user}`;
      case 'session_started':
        return `Session started: ${activity.user} → ${activity.expert}`;
      case 'dispute_raised':
        return `Dispute raised by ${activity.user}`;
      case 'booking_completed':
        return `Booking completed: ${activity.user} → ${activity.expert}`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings Overview</h1>
          <p className="text-muted-foreground">
            Manage all your booking operations from one central dashboard
          </p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-muted-foreground text-xs">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookingRequests}</div>
            <p className="text-muted-foreground text-xs">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Video className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoingSessions}</div>
            <p className="text-muted-foreground text-xs">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">{stats.revenueChange} from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <Link href="/bookings/requests">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                Booking Requests
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.bookingRequests}</div>
              <p className="text-muted-foreground text-xs">View all requests</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <Link href="/bookings/confirmed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Confirmed Bookings
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</div>
              <p className="text-muted-foreground text-xs">View confirmed sessions</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <Link href="/bookings/ongoing">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                Ongoing Sessions
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.ongoingSessions}</div>
              <p className="text-muted-foreground text-xs">Monitor live sessions</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <Link href="/bookings/disputes">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium flex items-center">
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Disputes
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.disputes}</div>
              <p className="text-muted-foreground text-xs">Resolve disputes</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest booking activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={activity.avatar}
                    alt={activity.user}
                  />
                  <AvatarFallback>
                    {activity.user.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getActivityText(activity)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {activity.time}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

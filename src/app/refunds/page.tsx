'use client';

import { useState } from 'react';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Video,
  XCircle,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
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

export default function RefundsPage() {
  // Sample data - in real app this would come from API
  const stats = {
    availableBalance: 8750,
    onHoldAmount: 1250,
    totalRefunded: 2300,
    pendingActions: 5,
  };

  const bookings = [
    {
      id: 1,
      customerName: 'Sarah Johnson',
      serviceName: 'Health Consultation',
      expertName: 'Dr. Michael Chen',
      date: '2024-02-20',
      time: '10:00 AM',
      amount: 150,
      status: 'Payment Received',
      paymentStatus: 'paid',
      isCompleted: false,
    },
    {
      id: 2,
      customerName: 'Robert Davis',
      serviceName: 'Mental Health Session',
      expertName: 'Dr. Sarah Williams',
      date: '2024-02-20',
      time: '2:00 PM',
      amount: 200,
      status: 'On Hold',
      paymentStatus: 'on_hold',
      isCompleted: false,
    },
    {
      id: 3,
      customerName: 'Emma Wilson',
      serviceName: 'Nutrition Consultation',
      expertName: 'Dr. James Brown',
      date: '2024-02-19',
      time: '3:00 PM',
      amount: 120,
      status: 'Completed',
      paymentStatus: 'completed',
      isCompleted: true,
    },
    {
      id: 4,
      customerName: 'Michael Brown',
      serviceName: 'Fitness Training',
      expertName: 'Dr. Lisa Anderson',
      date: '2024-02-19',
      time: '11:00 AM',
      amount: 100,
      status: 'Refunded',
      paymentStatus: 'refunded',
      isCompleted: false,
      autoRefunded: true,
      cancelledWithin: 2,
    },
    {
      id: 5,
      customerName: 'Jennifer Martinez',
      serviceName: 'Yoga Session',
      expertName: 'Dr. Robert Taylor',
      date: '2024-02-18',
      time: '9:00 AM',
      amount: 80,
      status: 'Auto Refunded',
      paymentStatus: 'auto_refunded',
      isCompleted: false,
      autoRefunded: true,
      cancelledWithin: 1,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Payment Received':
        return <Badge className="bg-blue-100 text-blue-800">Payment Received</Badge>;
      case 'On Hold':
        return <Badge className="bg-orange-100 text-orange-800">On Hold</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'Refunded':
        return <Badge className="bg-red-100 text-red-800">Refunded</Badge>;
      case 'Auto Refunded':
        return <Badge className="bg-red-100 text-red-800">Auto Refunded</Badge>;
      case 'Rescheduled':
        return <Badge className="bg-purple-100 text-purple-800">Rescheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActionButtons = (booking: any) => {
    if (booking.autoRefunded) {
      return (
        <Button variant="outline" size="sm" disabled>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Auto Refunded
        </Button>
      );
    }

    if (booking.isCompleted) {
      return (
        <Button variant="outline" size="sm" disabled>
          <CheckCircle className="mr-2 h-4 w-4" />
          Completed
        </Button>
      );
    }

    if (booking.paymentStatus === 'paid' && !booking.isCompleted) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reschedule
          </Button>
          <Button variant="destructive" size="sm">
            <XCircle className="mr-2 h-4 w-4" />
            Issue Refund
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refund & Reschedule Management</h1>
          <p className="text-muted-foreground">
            Manage refunds, reschedules, and payment status for all bookings
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.availableBalance.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold Amount</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.onHoldAmount.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Pending completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded (This Month)</CardTitle>
            <XCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRefunded.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">15 refunds processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingActions}</div>
            <p className="text-muted-foreground text-xs">Need your attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Booking Management
          </CardTitle>
          <CardDescription>
            View and manage all booking payments, refunds, and reschedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                {/* Auto Refund Timeline */}
                {booking.autoRefunded && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2 text-sm text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Auto Refund Timeline:</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-red-600">
                      <span>Booking Created</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>Cancelled ({booking.cancelledWithin} mins)</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>Auto Refunded</span>
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      This booking was cancelled within 3 minutes. The payment was automatically returned to the customer.
                    </p>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {booking.customerName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{booking.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.expertName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.date} at {booking.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">${booking.amount}</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {getActionButtons(booking)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

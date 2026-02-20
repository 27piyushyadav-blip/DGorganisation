'use client';

import { useState } from 'react';

import {
  Calendar,
  Clock,
  Filter,
  Phone,
  RefreshCw,
  Search,
  Video,
  XCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CancelledBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const cancelledBookings = [
    {
      id: 1,
      userName: 'Alice Brown',
      expertName: 'Dr. Carol White',
      date: '2024-02-13',
      time: '10:00 AM',
      duration: '30 min',
      type: 'online',
      status: 'cancelled',
      amount: '$60',
      userAvatar: '/avatars/alice.jpg',
      expertAvatar: '/avatars/carol.jpg',
      cancelReason: 'User requested cancellation',
      cancelledAt: '2024-02-13T09:45:00',
      cancelledBy: 'user',
      refundStatus: 'processed',
    },
    {
      id: 2,
      userName: 'David Wilson',
      expertName: 'Dr. Michael Johnson',
      date: '2024-02-12',
      time: '3:30 PM',
      duration: '45 min',
      type: 'offline',
      status: 'cancelled',
      amount: '$100',
      userAvatar: '/avatars/david.jpg',
      expertAvatar: '/avatars/michael.jpg',
      cancelReason: 'Expert not available',
      cancelledAt: '2024-02-12T15:00:00',
      cancelledBy: 'expert',
      refundStatus: 'processed',
    },
    {
      id: 3,
      userName: 'Emma Davis',
      expertName: 'Dr. Sarah Williams',
      date: '2024-02-11',
      time: '2:00 PM',
      duration: '60 min',
      type: 'online',
      status: 'cancelled',
      amount: '$120',
      userAvatar: '/avatars/emma.jpg',
      expertAvatar: '/avatars/sarah.jpg',
      cancelReason: 'Technical issues with platform',
      cancelledAt: '2024-02-11T13:30:00',
      cancelledBy: 'system',
      refundStatus: 'pending',
    },
  ];

  const getTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

  const getCancelIcon = (cancelledBy: string) => {
    switch (cancelledBy) {
      case 'user':
        return <XCircle className="h-4 w-4 text-blue-600" />;
      case 'expert':
        return <XCircle className="h-4 w-4 text-orange-600" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-purple-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRefundBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-green-100 text-green-800">Refunded</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cancelled Bookings</h1>
          <p className="text-muted-foreground">
            Review cancelled sessions and refund status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search cancelled bookings..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cancelled</CardTitle>
            <XCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledBookings.length}</div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Processed</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-muted-foreground text-xs">Refunds completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-muted-foreground text-xs">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <RefreshCw className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$160</div>
            <p className="text-muted-foreground text-xs">Amount returned</p>
          </CardContent>
        </Card>
      </div>

      {/* Cancelled Bookings List */}
      <div className="grid gap-4">
        {cancelledBookings.map((booking) => (
          <Card key={booking.id} className="border-l-4 border-l-red-400 opacity-75 hover:opacity-100 transition-opacity">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={booking.userAvatar}
                        alt={booking.userName}
                      />
                      <AvatarFallback>
                        {booking.userName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-border h-px w-6"></div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={booking.expertAvatar}
                        alt={booking.expertName}
                      />
                      <AvatarFallback>
                        {booking.expertName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {booking.userName} → {booking.expertName}
                    </CardTitle>
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <span>
                        {booking.date} at {booking.time}
                      </span>
                      <span>•</span>
                      <span>{booking.duration}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(booking.type)}
                        <span>{booking.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800">
                    Cancelled
                  </Badge>
                  <span className="font-semibold line-through text-muted-foreground">
                    {booking.amount}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cancellation Details */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    {getCancelIcon(booking.cancelledBy)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-red-800">
                          Cancellation Details
                        </h4>
                        <div className="text-xs text-red-600">
                          {new Date(booking.cancelledAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-red-700">Reason:</span>
                          <span className="text-sm text-red-600">{booking.cancelReason}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-red-700">Cancelled by:</span>
                          <span className="text-sm text-red-600 capitalize">
                            {booking.cancelledBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund Status */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">
                        Refund Status:
                      </span>
                    </div>
                    {getRefundBadge(booking.refundStatus)}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {booking.refundStatus === 'processed' && (
                      <Button size="sm" variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Download Receipt
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Again
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {cancelledBookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cancelled Bookings</h3>
            <p className="text-muted-foreground text-center mb-4">
              Great! There are no cancelled bookings at the moment.
            </p>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Create New Booking
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

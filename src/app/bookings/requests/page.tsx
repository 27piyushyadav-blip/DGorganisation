'use client';

import { useState } from 'react';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Phone,
  Search,
  Video,
  XCircle,
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

export default function BookingRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const bookingRequests = [
    {
      id: 1,
      userName: 'Jane Smith',
      expertName: 'Dr. Michael Johnson',
      date: '2024-02-15',
      time: '3:30 PM',
      duration: '45 min',
      type: 'offline',
      status: 'pending',
      amount: '$100',
      userAvatar: '/avatars/jane.jpg',
      expertAvatar: '/avatars/michael.jpg',
      requestDate: '2024-02-14',
    },
    {
      id: 2,
      userName: 'Alice Brown',
      expertName: 'Dr. Sarah Williams',
      date: '2024-02-15',
      time: '5:00 PM',
      duration: '60 min',
      type: 'online',
      status: 'pending',
      amount: '$120',
      userAvatar: '/avatars/alice.jpg',
      expertAvatar: '/avatars/sarah.jpg',
      requestDate: '2024-02-14',
    },
    {
      id: 3,
      userName: 'Robert Johnson',
      expertName: 'Dr. Emily Davis',
      date: '2024-02-16',
      time: '10:00 AM',
      duration: '30 min',
      type: 'online',
      status: 'pending',
      amount: '$80',
      userAvatar: '/avatars/robert.jpg',
      expertAvatar: '/avatars/emily.jpg',
      requestDate: '2024-02-15',
    },
  ];

  const getTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Requests</h1>
          <p className="text-muted-foreground">
            Review and approve pending booking requests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve All
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search booking requests..."
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingRequests.length}</div>
            <p className="text-muted-foreground text-xs">Pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-muted-foreground text-xs">Received today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-muted-foreground text-xs">-30min from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Requests List */}
      <div className="grid gap-4">
        {bookingRequests.map((booking) => (
          <Card key={booking.id} className="border-l-4 border-l-yellow-400">
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
                      <span>Requested: {booking.requestDate}</span>
                      <span>•</span>
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
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                  <span className="font-semibold">{booking.amount}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {bookingRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Booking Requests</h3>
            <p className="text-muted-foreground text-center mb-4">
              There are no pending booking requests at the moment.
            </p>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Check Back Later
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

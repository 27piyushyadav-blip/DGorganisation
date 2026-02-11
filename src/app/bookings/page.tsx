'use client';

import { useState } from 'react';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  User,
  Video,
  XCircle,
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const upcomingBookings = [
    {
      id: 1,
      userName: 'John Doe',
      expertName: 'Dr. Sarah Smith',
      date: '2024-02-15',
      time: '2:00 PM',
      duration: '60 min',
      type: 'online',
      status: 'confirmed',
      amount: '$120',
      userAvatar: '/avatars/john.jpg',
      expertAvatar: '/avatars/sarah.jpg',
    },
    {
      id: 2,
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
    },
  ];

  const pastBookings = [
    {
      id: 3,
      userName: 'Bob Johnson',
      expertName: 'Dr. Emily Davis',
      date: '2024-02-14',
      time: '4:00 PM',
      duration: '60 min',
      type: 'online',
      status: 'completed',
      amount: '$120',
      userAvatar: '/avatars/bob.jpg',
      expertAvatar: '/avatars/emily.jpg',
    },
    {
      id: 4,
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
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Booking Management
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-muted-foreground text-xs">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-muted-foreground text-xs">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Bookings
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">3 online, 9 offline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-muted-foreground text-xs">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={booking.userAvatar}
                            alt={booking.userName}
                          />
                          <AvatarFallback>
                            {booking.userName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-border h-px w-4"></div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={booking.expertAvatar}
                            alt={booking.expertName}
                          />
                          <AvatarFallback>
                            {booking.expertName
                              .split(' ')
                              .map((n) => n[0])
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
                      {getStatusBadge(booking.status)}
                      <span className="font-semibold">{booking.amount}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <>
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
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <>
                          <Button size="sm" variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reschedule
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={booking.userAvatar}
                            alt={booking.userName}
                          />
                          <AvatarFallback>
                            {booking.userName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-border h-px w-4"></div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={booking.expertAvatar}
                            alt={booking.expertName}
                          />
                          <AvatarFallback>
                            {booking.expertName
                              .split(' ')
                              .map((n) => n[0])
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
                      {getStatusBadge(booking.status)}
                      <span className="font-semibold">{booking.amount}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {booking.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          Download Receipt
                        </Button>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

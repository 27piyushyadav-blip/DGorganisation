'use client';

import { useState } from 'react';

import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Phone,
  Search,
  Star,
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

export default function CompletedBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const completedBookings = [
    {
      id: 1,
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
      rating: 5,
      completedAt: '2024-02-14T16:00:00',
      paymentStatus: 'paid',
    },
    {
      id: 2,
      userName: 'Alice Williams',
      expertName: 'Dr. Sarah Smith',
      date: '2024-02-14',
      time: '2:30 PM',
      duration: '45 min',
      type: 'offline',
      status: 'completed',
      amount: '$100',
      userAvatar: '/avatars/alice.jpg',
      expertAvatar: '/avatars/sarah.jpg',
      rating: 4.5,
      completedAt: '2024-02-14T14:30:00',
      paymentStatus: 'paid',
    },
    {
      id: 3,
      userName: 'Michael Brown',
      expertName: 'Dr. Michael Johnson',
      date: '2024-02-13',
      time: '10:00 AM',
      duration: '30 min',
      type: 'online',
      status: 'completed',
      amount: '$80',
      userAvatar: '/avatars/michael.jpg',
      expertAvatar: '/avatars/michael.jpg',
      rating: 4.8,
      completedAt: '2024-02-13T10:30:00',
      paymentStatus: 'paid',
    },
  ];

  const getTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Completed Bookings</h1>
          <p className="text-muted-foreground">
            View successful sessions and download receipts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
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
            placeholder="Search completed bookings..."
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
            <CardTitle className="text-sm font-medium">Today's Completions</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-muted-foreground text-xs">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-muted-foreground text-xs">Sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-muted-foreground text-xs">Customer satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250</div>
            <p className="text-muted-foreground text-xs">From completed sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Completed Bookings List */}
      <div className="grid gap-4">
        {completedBookings.map((booking) => (
          <Card key={booking.id} className="border-l-4 border-l-blue-400 hover:shadow-md transition-shadow">
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
                  <Badge className="bg-blue-100 text-blue-800">
                    Completed
                  </Badge>
                  <span className="font-semibold">{booking.amount}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Rating Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">
                        Session completed successfully
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <div className="flex items-center">
                        {renderStars(booking.rating)}
                        <span className="ml-1 text-sm font-medium">
                          {booking.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Receipt
                    </Button>
                    <Button size="sm" variant="outline">
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
      {completedBookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Completed Bookings</h3>
            <p className="text-muted-foreground text-center mb-4">
              There are no completed bookings at the moment.
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

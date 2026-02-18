'use client';

import { useState } from 'react';

import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Filter,
  MoreHorizontal,
  Star,
  TrendingUp,
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('today');

  const expertPerformance = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      rating: 4.8,
      totalRevenue: 1250,
      todayRevenue: 180,
      services: [
        { name: 'Business Consulting', bookings: 3, revenue: 90 },
        { name: 'Strategy Planning', bookings: 2, revenue: 90 },
      ],
      bookings: [
        { time: '10:00 AM', service: 'Business Consulting', customer: 'John D.', revenue: 30 },
        { time: '2:00 PM', service: 'Strategy Planning', customer: 'Mike R.', revenue: 45 },
        { time: '4:30 PM', service: 'Business Consulting', customer: 'Sarah L.', revenue: 30 },
      ],
      reviews: [
        { customer: 'John D.', rating: 5, comment: 'Excellent business insights!' },
        { customer: 'Mike R.', rating: 4, comment: 'Very professional advice' },
      ],
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      avatar: '/avatars/michael.jpg',
      rating: 4.6,
      totalRevenue: 980,
      todayRevenue: 120,
      services: [
        { name: 'Financial Advisory', bookings: 2, revenue: 80 },
        { name: 'Investment Planning', bookings: 1, revenue: 40 },
      ],
      bookings: [
        { time: '11:00 AM', service: 'Financial Advisory', customer: 'Emma S.', revenue: 40 },
        { time: '3:00 PM', service: 'Investment Planning', customer: 'Lisa K.', revenue: 40 },
        { time: '5:00 PM', service: 'Financial Advisory', customer: 'Anna M.', revenue: 40 },
      ],
      reviews: [
        { customer: 'Emma S.', rating: 5, comment: 'Great financial guidance!' },
        { customer: 'Lisa K.', rating: 4, comment: 'Smart investment strategies' },
      ],
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      avatar: '/avatars/emily.jpg',
      rating: 4.9,
      totalRevenue: 1450,
      todayRevenue: 200,
      services: [
        { name: 'Legal Consulting', bookings: 2, revenue: 120 },
        { name: 'Compliance Advisory', bookings: 1, revenue: 80 },
      ],
      bookings: [
        { time: '9:00 AM', service: 'Legal Consulting', customer: 'David B.', revenue: 60 },
        { time: '1:00 PM', service: 'Compliance Advisory', customer: 'Robert K.', revenue: 80 },
        { time: '6:00 PM', service: 'Legal Consulting', customer: 'Tom H.', revenue: 60 },
      ],
      reviews: [
        { customer: 'David B.', rating: 5, comment: 'Expert legal advice' },
        { customer: 'Robert K.', rating: 5, comment: 'Thorough compliance review' },
      ],
    },
  ];

  const totalRevenue = expertPerformance.reduce((sum, expert) => sum + expert.todayRevenue, 0);
  const totalBookings = expertPerformance.reduce((sum, expert) => sum + expert.bookings.length, 0);
  const averageRating = (expertPerformance.reduce((sum, expert) => sum + expert.rating, 0) / expertPerformance.length).toFixed(1);

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization Analytics</h2>
          <p className="text-muted-foreground">Track your expert performance and revenue</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">${totalRevenue}</p>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+15% from yesterday</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold mt-2">{totalBookings}</p>
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>8 completed today</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Experts</p>
                <p className="text-3xl font-bold mt-2">{expertPerformance.length}</p>
                <div className="flex items-center mt-2 text-sm text-purple-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>All online</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-3xl font-bold mt-2">{averageRating}</p>
                <div className="flex items-center mt-2 text-sm text-yellow-600">
                  <Star className="h-4 w-4 mr-1" />
                  <span>Excellent service</span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expert Performance Details */}
      <div className="space-y-6">
        {expertPerformance.map((expert) => (
          <Card key={expert.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={expert.avatar} alt={expert.name} />
                    <AvatarFallback>
                      {expert.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{expert.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{expert.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{expert.bookings.length} bookings today</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-semibold">${expert.todayRevenue}</p>
                    <p className="text-sm text-muted-foreground">Today's revenue</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Services Provided */}
              <div>
                <h4 className="font-medium mb-3">Services Provided Today</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expert.services.map((service, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${service.revenue}</p>
                          <p className="text-sm text-muted-foreground">revenue</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Timeline */}
              <div>
                <h4 className="font-medium mb-3">Booking Timeline</h4>
                <div className="space-y-2">
                  {expert.bookings.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">{booking.time}</div>
                        <div>
                          <p className="font-medium">{booking.service}</p>
                          <p className="text-sm text-muted-foreground">Customer: {booking.customer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${booking.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Reviews */}
              <div>
                <h4 className="font-medium mb-3">Customer Reviews</h4>
                <div className="space-y-3">
                  {expert.reviews.map((review, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{review.rating}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{review.customer}</p>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

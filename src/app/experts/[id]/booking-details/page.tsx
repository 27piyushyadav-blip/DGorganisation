'use client';

import { use } from 'react';
import { ArrowLeft, Star, Clock, DollarSign, Calendar, MessageSquare, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BookingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const resolvedParams = use(params);
  const expertId = parseInt(resolvedParams.id);
  
  // Mock data - in a real app, this would come from an API
  const expertData = {
    id: expertId,
    name: 'Smarth D.P.',
    avatar: '/avatars/smarth.jpg',
    todayRevenue: 315,
    todayIncome: 85,
    totalIncome: 315,
    bookings: [
      {
        id: 1,
        customerName: 'Emily Watson',
        time: '10:00 AM',
        price: 50,
        service: 'Career Counseling',
        rating: 4.5,
        feedback: 'Great very helpful!',
        date: 'Today'
      },
      {
        id: 2,
        customerName: 'John Doe',
        time: '11:00 AM',
        price: 75,
        service: 'Digital Marketing Consultation',
        rating: 4.5,
        feedback: 'Excellent insights and strategies!',
        date: 'Today'
      },
      {
        id: 3,
        customerName: 'Sarah Lee',
        time: '1:00 PM',
        price: 60,
        service: 'Fitness Training',
        rating: 4.0,
        feedback: 'Very professional and motivating.',
        date: 'Today'
      },
      {
        id: 4,
        customerName: 'Michael Brown',
        time: '3:00 PM',
        price: 90,
        service: 'Software Development Consulting',
        rating: 5.0,
        feedback: 'Amazing technical expertise!',
        date: 'Today'
      },
      {
        id: 5,
        customerName: 'Lisa White',
        time: '4:30 PM',
        price: 40,
        service: 'Yoga Session',
        rating: 4.0,
        feedback: 'Relaxing and rejuvenating session.',
        date: 'Today'
      }
    ],
    reviews: [
      {
        id: 1,
        customerName: 'Emily Watson',
        rating: 4.5,
        feedback: 'Great very helpful!',
        date: 'Today'
      },
      {
        id: 2,
        customerName: 'John Doe',
        rating: 4.5,
        feedback: 'Excellent insights and strategies!',
        date: 'Today'
      },
      {
        id: 3,
        customerName: 'Sarah Lee',
        rating: 4.0,
        feedback: 'Very professional and motivating.',
        date: 'Today'
      },
      {
        id: 4,
        customerName: 'Michael Brown',
        rating: 5.0,
        feedback: 'Amazing technical expertise!',
        date: 'Today'
      }
    ]
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-200'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/experts">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Experts</span>
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Booking Details</h2>
            <p className="text-muted-foreground">View expert's booking information and performance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Much Narrower */}
        <div className="lg:col-span-1 space-y-6">
          {/* Expert Profile Card - Smaller */}
          <Card className="w-full">
            <CardHeader className="flex flex-col items-center text-center pt-6 pb-4">
              <Avatar className="h-16 w-16 mb-3">
                <AvatarImage src={expertData.avatar} alt={expertData.name} />
                <AvatarFallback className="text-2xl">
                  {expertData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{expertData.name}</CardTitle>
              <Badge variant="secondary" className="mt-1 text-xs font-normal">D.P</Badge>
            </CardHeader>
          </Card>

          {/* Ratings & Reviews (Summary) - Simple List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Ratings & Reviews</CardTitle>
              <Button variant="link" size="sm" className="text-xs p-0">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {expertData.reviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {review.customerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{review.customerName}</p>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Much Wider (3/4) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Today's Bookings - Table Format */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Today's Bookings</CardTitle>
              <Button variant="link" size="sm" className="text-sm p-0">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              {/* Table Headers */}
              <div className="grid grid-cols-4 gap-4 pb-2 border-b">
                <div className="text-sm font-medium text-muted-foreground">Customer Name</div>
                <div className="text-sm font-medium text-muted-foreground">Time</div>
                <div className="text-sm font-medium text-muted-foreground">Price</div>
                <div className="text-sm font-medium text-muted-foreground">Service</div>
              </div>
              {/* Table Rows */}
              <div className="space-y-2 pt-2">
                {expertData.bookings.map((booking) => (
                  <div key={booking.id} className="grid grid-cols-4 gap-4 py-2">
                    <div className="text-sm font-medium">{booking.customerName}</div>
                    <div className="text-sm">{booking.time}</div>
                    <div className="text-sm text-green-600 font-medium">${booking.price}</div>
                    <div className="text-sm text-muted-foreground">{booking.service}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ratings & Reviews and Revenue Overview - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ratings & Reviews (Detailed) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Ratings & Reviews</CardTitle>
                <Button variant="link" size="sm" className="text-sm p-0">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expertData.reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{review.customerName}</p>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.feedback}</p>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Feedback
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Revenue Overview</CardTitle>
                <Button variant="link" size="sm" className="text-sm p-0">
                  View Details <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expert Total Income</p>
                    <p className="text-2xl font-bold">${expertData.totalIncome}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 font-medium">↑ ${expertData.todayIncome}</p>
                    <p className="text-xs text-muted-foreground">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

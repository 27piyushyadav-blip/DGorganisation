'use client';

import { useState } from 'react';

import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Phone,
  RefreshCw,
  Search,
  Video,
  XCircle,
  X,
  Star,
  AlertTriangle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ConfirmedBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedExpert, setSelectedExpert] = useState('');
  const [comment, setComment] = useState('');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsBooking, setSelectedDetailsBooking] = useState<any>(null);

  const confirmedBookings = [
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
      userName: 'Emma Wilson',
      expertName: 'Dr. Michael Johnson',
      date: '2024-02-15',
      time: '4:30 PM',
      duration: '45 min',
      type: 'offline',
      status: 'confirmed',
      amount: '$100',
      userAvatar: '/avatars/emma.jpg',
      expertAvatar: '/avatars/michael.jpg',
    },
    {
      id: 3,
      userName: 'Michael Brown',
      expertName: 'Dr. Emily Davis',
      date: '2024-02-16',
      time: '10:00 AM',
      duration: '30 min',
      type: 'online',
      status: 'confirmed',
      amount: '$80',
      userAvatar: '/avatars/michael.jpg',
      expertAvatar: '/avatars/emily.jpg',
    },
  ];

  const getTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

  const availableExperts = [
    {
      id: 1,
      name: 'Suraj',
      rating: 5,
      rate: 200,
      avatar: '/avatars/suraj.jpg',
      available: true,
    },
    {
      id: 2,
      name: 'Akan',
      rating: 4.5,
      rate: 180,
      avatar: '/avatars/akan.jpg',
      available: true,
    },
    {
      id: 3,
      name: 'Mehta',
      rating: 4.8,
      rate: 220,
      avatar: '/avatars/mehta.jpg',
      available: false,
    },
  ];

  const timeSlots = [
    '9:00 AM - 9:30 AM',
    '9:30 AM - 10:30 AM',
    '10:00 AM - 10:30 AM',
    '11:00 AM - 12:00 PM',
    '11:30 AM - 12:00 PM',
    '12:00 PM - 12:30 PM',
    '12:30 PM - 1:00 PM',
  ];

  const dateOptions = [
    { value: 'tomorrow', label: 'Tomorrow, Tuesday, April 23' },
    { value: 'today', label: 'Today, Monday, April 22' },
    { value: 'wednesday', label: 'Wednesday, April 24' },
    { value: 'thursday', label: 'Thursday, April 25' },
  ];

  const handleReschedule = (booking: any) => {
    setSelectedBooking(booking);
    setIsRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = () => {
    console.log('Rescheduling booking:', {
      booking: selectedBooking,
      date: selectedDate,
      time: selectedTime,
      expert: selectedExpert,
      comment,
    });
    setIsRescheduleModalOpen(false);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedExpert('');
    setComment('');
  };

  const handleRefund = (booking: any) => {
    setSelectedBooking(booking);
    // Extract amount from string like "$150"
    const amount = parseInt(booking.amount.replace(/[^0-9]/g, ''));
    setRefundAmount(amount.toString());
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = () => {
    console.log('Issuing refund:', {
      booking: selectedBooking,
      amount: refundAmount,
      reason: refundReason,
    });
    
    setIsRefundModalOpen(false);
    setRefundReason('');
    setRefundAmount('');
    setSelectedBooking(null);
  };

  const handleViewDetails = (booking: any) => {
    setSelectedDetailsBooking(booking);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Confirmed Bookings</h1>
          <p className="text-muted-foreground">
            View and manage upcoming confirmed sessions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Export Calendar
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
            placeholder="Search confirmed bookings..."
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
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-muted-foreground text-xs">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-muted-foreground text-xs">Upcoming sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$300</div>
            <p className="text-muted-foreground text-xs">From confirmed bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Confirmed Bookings List */}
      <div className="grid gap-4">
        {confirmedBookings.map((booking) => (
          <Card key={booking.id} className="border-l-4 border-l-green-400">
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
                  <Badge className="bg-green-100 text-green-800">
                    Confirmed
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
                    variant="outline"
                    onClick={() => handleReschedule(booking)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reschedule
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRefund(booking)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Issue Refund
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {confirmedBookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Confirmed Bookings</h3>
            <p className="text-muted-foreground text-center mb-4">
              There are no confirmed bookings at the moment.
            </p>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Create New Booking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                Reschedule Service Session
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRescheduleModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Date and Time Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Suggest Reschedule Date
                </label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      className={`justify-start h-auto p-3 text-sm ${
                        selectedTime === slot
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Add Comment (Optional)
                </label>
                <Textarea
                  placeholder="Enter any additional comments or reasons for rescheduling..."
                  value={comment}
                  onChange={(e: any) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column - Expert Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Choose Expert for Service
                </h3>
                <div className="space-y-3">
                  {availableExperts.map((expert) => (
                    <div
                      key={expert.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedExpert === expert.id.toString()
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedExpert(expert.id.toString())}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={expert.avatar}
                              alt={expert.name}
                            />
                            <AvatarFallback>
                              {expert.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {expert.name}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {expert.rating}
                              </div>
                              <span>•</span>
                              <span>${expert.rate}/hr</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={
                            selectedExpert === expert.id.toString() ? "default" : "outline"
                          }
                          className="text-xs"
                        >
                          {selectedExpert === expert.id.toString() ? "Selected" : "Select"}
                        </Button>
                      </div>
                      {!expert.available && (
                        <div className="mt-2 text-xs text-red-600">
                          Not available at selected time
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Both Parties Notified: Service Rescheduled</span>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsRescheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleConfirmReschedule}
                disabled={!selectedDate || !selectedTime || !selectedExpert}
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Refund Modal */}
      <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                Issue Refund
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRefundModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Booking Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Customer:</strong> {selectedBooking?.userName}</p>
                <p><strong>Service:</strong> {selectedBooking?.duration} Session</p>
                <p><strong>Expert:</strong> {selectedBooking?.expertName}</p>
                <p><strong>Original Amount:</strong> {selectedBooking?.amount}</p>
              </div>
            </div>

            {/* Refund Amount */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Refund Amount ($)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                max={parseInt(selectedBooking?.amount?.replace(/[^0-9]/g, '') || 0)}
                step="0.01"
                required
              />
            </div>

            {/* Refund Reason */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Refund Reason
              </label>
              <Textarea
                placeholder="Please explain why this refund is being issued..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Refund Warning</span>
              </div>
              <p className="text-xs text-red-600 mt-2">
                This action will process a refund to the customer's original payment method. 
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span>Refund will be processed immediately</span>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsRefundModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmRefund}
                disabled={!refundAmount || !refundReason.trim()}
              >
                Process Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                Booking Details
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedDetailsBooking && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedDetailsBooking.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-medium">{selectedDetailsBooking.duration} Session</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{selectedDetailsBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">{selectedDetailsBooking.time}</p>
                  </div>
                </div>
              </div>

              {/* Expert Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3">Expert Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Expert Name</p>
                    <p className="font-medium">{selectedDetailsBooking.expertName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{selectedDetailsBooking.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{selectedDetailsBooking.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium">{selectedDetailsBooking.amount}</p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3">Status Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking Status</p>
                    <p className="font-medium">Confirmed</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Session Type</p>
                    <p className="font-medium">{selectedDetailsBooking.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-medium">Paid</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{selectedDetailsBooking.date}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

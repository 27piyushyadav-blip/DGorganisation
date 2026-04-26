'use client';

import { useState } from 'react';

import {
  Clock,
  Filter,
  Phone,
  Search,
  Video,
  MoreHorizontal,
  RefreshCw,
  X,
  Star,
  AlertTriangle,
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

export default function OngoingSessionsPage() {
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

  const ongoingSessions = [
    {
      id: 1,
      userName: 'David Wilson',
      expertName: 'Dr. Sarah Smith',
      date: '2024-02-15',
      time: '2:00 PM',
      duration: '60 min',
      type: 'online',
      status: 'ongoing',
      amount: '$120',
      userAvatar: '/avatars/david.jpg',
      expertAvatar: '/avatars/sarah.jpg',
      startTime: '2024-02-15T14:00:00',
      joinUrl: 'https://meet.example.com/session/123',
      elapsedTime: '15 min',
    },
    {
      id: 2,
      userName: 'Lisa Anderson',
      expertName: 'Dr. Michael Johnson',
      date: '2024-02-15',
      time: '3:30 PM',
      duration: '45 min',
      type: 'offline',
      status: 'ongoing',
      amount: '$100',
      userAvatar: '/avatars/lisa.jpg',
      expertAvatar: '/avatars/michael.jpg',
      startTime: '2024-02-15T15:30:00',
      elapsedTime: '5 min',
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
    console.log('Rescheduling ongoing session:', {
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
          <h1 className="text-3xl font-bold tracking-tight">Ongoing Sessions</h1>
          <p className="text-muted-foreground">
            Monitor and manage currently active sessions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Session Logs
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search ongoing sessions..."
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
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Video className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingSessions.length}</div>
            <p className="text-muted-foreground text-xs">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 min</div>
            <p className="text-muted-foreground text-xs">Average session length</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-muted-foreground text-xs">Sessions completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Ongoing Sessions List */}
      <div className="grid gap-4">
        {ongoingSessions.map((session) => (
          <Card key={session.id} className="border-l-4 border-l-purple-400">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.userAvatar}
                        alt={session.userName}
                      />
                      <AvatarFallback>
                        {session.userName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-border h-px w-6"></div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.expertAvatar}
                        alt={session.expertName}
                      />
                      <AvatarFallback>
                        {session.expertName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {session.userName} → {session.expertName}
                    </CardTitle>
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <span>
                        Started: {session.time}
                      </span>
                      <span>•</span>
                      <span>Duration: {session.duration}</span>
                      <span>•</span>
                      <span>Elapsed: {session.elapsedTime}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(session.type)}
                        <span>{session.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Badge className="bg-purple-100 text-purple-800">
                      Live
                    </Badge>
                  </div>
                  <span className="font-semibold">{session.amount}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      Session in progress
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {session.type === 'online' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Video className="mr-2 h-4 w-4" />
                      Join Session
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    Monitor
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReschedule(session)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reschedule
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRefund(session)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Issue Refund
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDetails(session)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {ongoingSessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ongoing Sessions</h3>
            <p className="text-muted-foreground text-center mb-4">
              There are no active sessions at the moment.
            </p>
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Check Session History
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
                Session Details
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

              {/* Session Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3">Session Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">Live</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Session Type</p>
                    <p className="font-medium">{selectedDetailsBooking.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-medium">{selectedDetailsBooking.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Elapsed Time</p>
                    <p className="font-medium">{selectedDetailsBooking.elapsedTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Join URL</p>
                    <p className="font-medium text-blue-600 underline">{selectedDetailsBooking.joinUrl || 'N/A'}</p>
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

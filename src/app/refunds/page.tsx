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
  X,
  Star,
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

export default function RefundsPage() {
  // Sample data - in real app this would come from API
  const stats = {
    availableBalance: 8750,
    onHoldAmount: 1250,
    totalRefunded: 2300,
    pendingActions: 5,
  };

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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleReschedule(booking)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reschedule
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
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
      );
    }

    return null;
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
    console.log('Rescheduling refund booking:', {
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
    setRefundAmount(booking.amount.toString());
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = () => {
    console.log('Issuing refund:', {
      booking: selectedBooking,
      amount: refundAmount,
      reason: refundReason,
    });
    
    // Here you would typically make an API call to process the refund
    // For now, we'll just log it and close the modal
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
                <p><strong>Customer:</strong> {selectedBooking?.customerName}</p>
                <p><strong>Service:</strong> {selectedBooking?.serviceName}</p>
                <p><strong>Expert:</strong> {selectedBooking?.expertName}</p>
                <p><strong>Original Amount:</strong> ${selectedBooking?.amount}</p>
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
                max={selectedBooking?.amount || 0}
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
                    <p className="font-medium">{selectedDetailsBooking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-medium">{selectedDetailsBooking.serviceName}</p>
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
                    <p className="font-medium">{selectedDetailsBooking.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{selectedDetailsBooking.type || 'N/A'}</p>
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
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-medium">{selectedDetailsBooking.paymentStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Booking Status</p>
                    <p className="font-medium">{selectedDetailsBooking.status || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="font-medium">{selectedDetailsBooking.isCompleted ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Auto Refunded</p>
                    <p className="font-medium">{selectedDetailsBooking.autoRefunded ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {selectedDetailsBooking.cancelledWithin && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-3">Refund Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Cancelled Within</p>
                    <p className="font-medium">{selectedDetailsBooking.cancelledWithin} minutes</p>
                  </div>
                </div>
              )}
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

'use client';

import { useState, useEffect } from 'react';

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
  RefreshCw,
  X,
  Star,
  AlertTriangle,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  MoreVertical,
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
import {
  getOrganizationBookingsApi,
  acceptBookingApi,
  rejectBookingApi,
  rescheduleBookingApi,
  createRefundRequestApi,
} from '@/client/api/bookings';

export default function BookingRequestsPage() {
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
  
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getOrganizationBookingsApi('pending');
      const mapped = (res.bookings || []).map((b: any) => {
        const d = new Date(b.scheduledDate);
        return {
          id: b.id,
          userName: b.clientName || 'Customer',
          clientPhone: b.clientPhone || '+1 234 567 890',
          expertName: b.expertName || 'Expert',
          expertSpecialty: b.expertSpecialty || 'Therapy',
          date: d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }),
          time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          duration: `${b.duration || 60} min`,
          type: b.type || 'online',
          status: b.status,
          amount: b.amount ? (b.amount.startsWith('$') ? b.amount : `$${b.amount}`) : '$0',
          userAvatar: b.userAvatar || '',
          expertAvatar: b.expertAvatar || '',
          requestDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A',
          createdAt: b.createdAt || new Date().toISOString(),
          scheduledDate: b.scheduledDate,
        };
      });
      setBookingRequests(mapped);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleApprove = async (bookingId: string) => {
    try {
      await acceptBookingApi(bookingId);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to approve booking request');
    }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt('Please enter rejection reason (optional):');
    if (reason === null) return;
    try {
      await rejectBookingApi(bookingId, reason);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to reject booking request');
    }
  };

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

  const handleConfirmReschedule = async () => {
    if (!selectedBooking || !selectedDate || !selectedTime) return;
    const newDate = new Date();
    if (selectedDate === 'tomorrow') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (selectedDate === 'wednesday') {
      newDate.setDate(newDate.getDate() + 2);
    } else if (selectedDate === 'thursday') {
      newDate.setDate(newDate.getDate() + 3);
    }
    
    const [timeStr, period] = selectedTime.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    newDate.setHours(hours, minutes, 0, 0);

    try {
      await rescheduleBookingApi(selectedBooking.id, {
        scheduledDate: newDate.toISOString(),
        expertId: selectedExpert || undefined,
      });
      setIsRescheduleModalOpen(false);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedExpert('');
      setComment('');
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule booking');
    }
  };

  const handleRefund = (booking: any) => {
    setSelectedBooking(booking);
    const amount = parseInt((booking.amount || '0').replace(/[^0-9]/g, ''));
    setRefundAmount(amount.toString());
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedBooking || !refundAmount || !refundReason.trim()) return;
    try {
      await createRefundRequestApi({
        bookingId: selectedBooking.id,
        amount: refundAmount,
        reason: refundReason,
        refundType: 'full',
      });
      setIsRefundModalOpen(false);
      setRefundReason('');
      setRefundAmount('');
      setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to issue refund');
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedDetailsBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const filteredBookingRequests = bookingRequests.filter((booking) => {
    const search = searchTerm.toLowerCase();
    return (
      booking.userName.toLowerCase().includes(search) ||
      booking.expertName.toLowerCase().includes(search) ||
      booking.service.toLowerCase().includes(search) ||
      booking.id.toLowerCase().includes(search)
    );
  });

  const totalItems = filteredBookingRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookingRequests = filteredBookingRequests.slice(startIndex, startIndex + itemsPerPage);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const newTodayCount = bookingRequests.filter((b: any) => {
    const date = new Date(b.createdAt);
    return date >= startOfToday && date < endOfToday;
  }).length;

  const pendingCount = bookingRequests.length;

  const expiringCount = bookingRequests.filter((b: any) => {
    const date = new Date(b.scheduledDate);
    const diffTime = date.getTime() - now.getTime();
    return diffTime > 0 && diffTime < 24 * 60 * 60 * 1000;
  }).length;

  const totalValue = bookingRequests.reduce((sum: number, b: any) => {
    const val = parseFloat(b.amount.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all incoming booking requests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-[#8b4513] text-white hover:bg-[#70360f] font-semibold flex items-center shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 border-gray-200 bg-white"
          />
        </div>
        <Button variant="outline" className="flex items-center h-10 bg-white border-gray-200">
          <Filter className="mr-2 h-4 w-4 text-gray-500" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* New Today */}
        <Card className="flex items-center p-4 bg-white border-gray-100">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Today</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{newTodayCount}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +20% from yesterday
            </p>
          </div>
        </Card>

        {/* Pending */}
        <Card className="flex items-center p-4 bg-white border-gray-100">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600 mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{pendingCount}</h3>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1" /> -5% from yesterday
            </p>
          </div>
        </Card>

        {/* Expiring Soon */}
        <Card className="flex items-center p-4 bg-white border-gray-100">
          <div className="p-3 rounded-lg bg-red-50 text-red-600 mr-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiring Soon</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{expiringCount}</h3>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </div>
        </Card>

        {/* Total Value */}
        <Card className="flex items-center p-4 bg-white border-gray-100">
          <div className="p-3 rounded-lg bg-green-50 text-green-600 mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">${totalValue.toLocaleString()}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from yesterday
            </p>
          </div>
        </Card>
      </div>

      {/* Booking Requests Table */}
      {filteredBookingRequests.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold">
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Customer</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Service & Duration</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Expert Requested</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Requested Time</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Amount</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBookingRequests.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={booking.userAvatar} alt={booking.userName} />
                        <AvatarFallback className="bg-amber-100 text-amber-800 font-bold">
                          {booking.userName.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{booking.userName}</div>
                        <div className="text-xs text-muted-foreground">{booking.clientPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{booking.service}</div>
                      <div className="text-xs text-muted-foreground">{booking.duration}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.expertAvatar} alt={booking.expertName} />
                        <AvatarFallback className="bg-blue-100 text-blue-800 font-bold text-xs">
                          {booking.expertName.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900 text-xs">{booking.expertName}</div>
                        <div className="text-[10px] text-muted-foreground">{booking.expertSpecialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{booking.date}</div>
                      <div className="text-xs text-muted-foreground">{booking.time}</div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gray-900">
                    {booking.amount}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold h-8 rounded-md px-3"
                        onClick={() => handleApprove(booking.id)}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900 font-semibold h-8 rounded-md px-3"
                        onClick={() => handleReschedule(booking)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold h-8 rounded-md px-3"
                        onClick={() => handleReject(booking.id)}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700 font-semibold h-8 rounded-md px-3 border-gray-200"
                        onClick={() => handleViewDetails(booking)}
                      >
                        Message
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-white border-gray-100">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Booking Requests</h3>
            <p className="text-muted-foreground text-center mb-4">
              There are no pending booking requests at the moment.
            </p>
            <Button variant="outline" onClick={loadBookings}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh list
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-1 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 border-gray-200"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 ${
                currentPage === page 
                  ? "bg-[#8b4513] hover:bg-[#70360f] text-white" 
                  : "border-gray-200"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 border-gray-200"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            {">"}
          </Button>
        </div>
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
                Booking Request Details
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

              {/* Request Information */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3">Request Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">Pending</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Request Date</p>
                    <p className="font-medium">{selectedDetailsBooking.requestDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Session Date</p>
                    <p className="font-medium">{selectedDetailsBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Session Time</p>
                    <p className="font-medium">{selectedDetailsBooking.time}</p>
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

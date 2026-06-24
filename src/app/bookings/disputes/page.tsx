'use client';

import { useState, useEffect } from 'react';

import {
  Clock,
  Filter,
  Phone,
  RefreshCw,
  Search,
  Video,
  XCircle,
  X,
  Star,
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

import { rescheduleBookingApi } from '@/client/api/bookings';
import { 
  getRefundRequestsApi, 
  approveRefundApi, 
  rejectRefundApi, 
  getOrganizationExpertsForOrderApi 
} from '@/client/api/services-bookings';

export default function DisputesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedExpert, setSelectedExpert] = useState('');
  const [comment, setComment] = useState('');

  const [disputes, setDisputes] = useState<any[]>([]);
  const [availableExperts, setAvailableExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getRefundRequestsApi();
      const mapped = (res || []).map((item: any) => {
        const refund = item.refund;
        const client = item.client || {};
        const booking = item.booking || {};
        const expert = item.expert || {};
        const expertProfile = item.expertProfile || {};
        
        const d = new Date(booking.scheduledDate || refund.createdAt);
        return {
          id: refund.id,
          bookingId: booking.id,
          userName: client.name || 'Client',
          expertName: expert.name || 'Expert',
          date: d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }),
          time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          duration: booking.duration ? `${booking.duration} min` : '45 min',
          type: booking.consultationType || 'online',
          status: booking.status || 'disputed',
          amount: refund.amount ? (refund.amount.startsWith('$') ? refund.amount : `$${refund.amount}`) : `$${booking.amount || '0'}`,
          userAvatar: client.image || '',
          expertAvatar: expertProfile.profileImage || expert.image || '',
          disputeReason: refund.reason || 'No reason provided',
          disputeStatus: refund.status, // pending, approved, rejected, processing
          caseId: `#D${refund.id.slice(0, 4).toUpperCase()}`,
        };
      });
      setDisputes(mapped);

      const expertsRes = await getOrganizationExpertsForOrderApi();
      setAvailableExperts(expertsRes.experts || []);
      
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const getTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

  const handleReschedule = (dispute: any) => {
    setSelectedBooking({
      id: dispute.bookingId,
      ...dispute
    });
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
    } else if (selectedDate === 'today') {
      // already today
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
      setSelectedBooking(null);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedExpert('');
      setComment('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule booking');
    }
  };

  const handleResolveDispute = async (refundId: string) => {
    if (!confirm('Are you sure you want to approve this refund and resolve the dispute?')) return;
    try {
      await approveRefundApi(refundId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve dispute');
    }
  };

  const handleDenyRefund = async (refundId: string) => {
    const reason = prompt('Please enter a reason for denying this refund request (optional):');
    if (reason === null) return;
    try {
      await rejectRefundApi(refundId, reason || 'Deny refund request');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to deny refund');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const search = searchTerm.toLowerCase();
    return (
      dispute.userName.toLowerCase().includes(search) ||
      dispute.expertName.toLowerCase().includes(search) ||
      dispute.disputeReason.toLowerCase().includes(search) ||
      dispute.caseId.toLowerCase().includes(search)
    );
  });

  const pendingCount = disputes.filter(d => d.disputeStatus === 'pending').length;

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading disputes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold">Error Loading Disputes</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disputes</h1>
          <p className="text-muted-foreground">
            Manage and resolve booking disputes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search disputes..."
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
            <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
            <XCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes.length}</div>
            <p className="text-muted-foreground text-xs">All claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Resolution</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-muted-foreground text-xs">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-muted-foreground text-xs">-2h from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Disputes List */}
      <div className="grid gap-4">
        {filteredDisputes.map((dispute) => (
          <Card key={dispute.id} className="border-l-4 border-l-orange-400">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={dispute.userAvatar}
                        alt={dispute.userName}
                      />
                      <AvatarFallback>
                        {dispute.userName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-border h-px w-6"></div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={dispute.expertAvatar}
                        alt={dispute.expertName}
                      />
                      <AvatarFallback>
                        {dispute.expertName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {dispute.userName} → {dispute.expertName}
                    </CardTitle>
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <span>
                        {dispute.date} at {dispute.time}
                      </span>
                      <span>•</span>
                      <span>{dispute.duration}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(dispute.type)}
                        <span className="capitalize">{dispute.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(dispute.disputeStatus)}
                  <span className="font-semibold">{dispute.amount}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <XCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-muted-foreground">
                      {dispute.disputeReason}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {dispute.caseId}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReschedule(dispute)}
                      disabled={dispute.disputeStatus !== 'pending'}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reschedule
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleResolveDispute(dispute.id)}
                      disabled={dispute.disputeStatus !== 'pending'}
                    >
                      Resolve Dispute
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDenyRefund(dispute.id)}
                      disabled={dispute.disputeStatus !== 'pending'}
                    >
                      Deny Refund
                    </Button>
                  </div>
                  <Button size="sm" variant="outline">
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDisputes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Disputes Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              There are no booking disputes at the moment.
            </p>
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
                        selectedExpert === expert.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedExpert(expert.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={expert.profileImage || expert.image}
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
                                {expert.rating || 0}
                              </div>
                              <span>•</span>
                              <span>{expert.specialization || expert.category || 'Expert'}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={
                            selectedExpert === expert.id ? "default" : "outline"
                          }
                          className="text-xs"
                        >
                          {selectedExpert === expert.id ? "Selected" : "Select"}
                        </Button>
                      </div>
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
    </div>
  );
}

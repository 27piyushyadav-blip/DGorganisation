'use client';

import { useState } from 'react';

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

export default function DisputesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedExpert, setSelectedExpert] = useState('');
  const [comment, setComment] = useState('');

  const disputes = [
    {
      id: 1,
      userName: 'Emma Davis',
      expertName: 'Dr. Michael Johnson',
      date: '2024-02-14',
      time: '3:30 PM',
      duration: '45 min',
      type: 'offline',
      status: 'disputed',
      amount: '$100',
      userAvatar: '/avatars/emma.jpg',
      expertAvatar: '/avatars/michael.jpg',
      disputeReason: 'Expert not available',
      disputeStatus: 'pending_resolution',
      caseId: '#D1023',
    },
    {
      id: 2,
      userName: 'Robert Johnson',
      expertName: 'Dr. Sarah Williams',
      date: '2024-02-13',
      time: '10:00 AM',
      duration: '60 min',
      type: 'online',
      status: 'disputed',
      amount: '$120',
      userAvatar: '/avatars/robert.jpg',
      expertAvatar: '/avatars/sarah.jpg',
      disputeReason: 'Service quality issues',
      disputeStatus: 'under_review',
      caseId: '#D1024',
    },
  ];

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

  const getTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

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
    setSelectedBooking(null);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedExpert('');
    setComment('');
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
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
            <p className="text-muted-foreground text-xs">Need resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Resolution</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
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
        {disputes.map((dispute) => (
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
                        <span>{dispute.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    Disputed
                  </Badge>
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
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reschedule
                    </Button>
                    <Button size="sm" variant="outline">
                      Resolve Dispute
                    </Button>
                    <Button size="sm" variant="destructive">
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
    </div>
  );
}

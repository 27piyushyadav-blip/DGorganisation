'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: RescheduleData) => void;
  booking: {
    customerName: string;
    serviceName: string;
    expertName: string;
    currentExpert: string;
  };
}

interface RescheduleData {
  newExpert: string;
  newDate: string;
  newTime: string;
  reason: string;
}

export default function RescheduleModal({ isOpen, onClose, onConfirm, booking }: RescheduleModalProps) {
  const [formData, setFormData] = useState<RescheduleData>({
    newExpert: booking.currentExpert,
    newDate: '',
    newTime: '',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const experts = [
    { id: '1', name: 'Dr. Michael Chen' },
    { id: '2', name: 'Dr. Sarah Williams' },
    { id: '3', name: 'Dr. James Brown' },
    { id: '4', name: 'Dr. Lisa Anderson' },
    { id: '5', name: 'Dr. Robert Taylor' },
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newDate || !formData.newTime || !formData.reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onConfirm(formData);
      onClose();
      // Reset form
      setFormData({
        newExpert: booking.currentExpert,
        newDate: '',
        newTime: '',
        reason: '',
      });
    } catch (error) {
      console.error('Error rescheduling:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Service Session</DialogTitle>
          <DialogDescription>
            Select a new date, time, and expert for this booking. The customer will be notified automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Current Booking</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Customer:</strong> {booking.customerName}</p>
              <p><strong>Service:</strong> {booking.serviceName}</p>
              <p><strong>Current Expert:</strong> {booking.expertName}</p>
            </div>
          </div>

          {/* New Expert Selection */}
          <div className="space-y-2">
            <Label htmlFor="newExpert">Select New Expert</Label>
            <Select
              value={formData.newExpert}
              onValueChange={(value) => setFormData({ ...formData, newExpert: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an expert" />
              </SelectTrigger>
              <SelectContent>
                {experts.map((expert) => (
                  <SelectItem key={expert.id} value={expert.name}>
                    {expert.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="newDate">Select New Date</Label>
            <input
              type="date"
              id="newDate"
              value={formData.newDate}
              onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* New Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="newTime">Select New Time</Label>
            <Select
              value={formData.newTime}
              onValueChange={(value) => setFormData({ ...formData, newTime: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason for Reschedule */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Reschedule</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why this session needs to be rescheduled..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.newDate || !formData.newTime || !formData.reason.trim()}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Reschedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

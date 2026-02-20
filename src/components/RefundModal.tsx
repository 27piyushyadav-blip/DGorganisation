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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, DollarSign } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: RefundData) => void;
  booking: {
    customerName: string;
    serviceName: string;
    paidAmount: number;
  };
}

interface RefundData {
  refundType: 'full' | 'partial';
  refundAmount: number;
  reason: string;
}

export default function RefundModal({ isOpen, onClose, onConfirm, booking }: RefundModalProps) {
  const [formData, setFormData] = useState<RefundData>({
    refundType: 'full',
    refundAmount: booking.paidAmount,
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefundTypeChange = (type: 'full' | 'partial') => {
    setFormData({
      ...formData,
      refundType: type,
      refundAmount: type === 'full' ? booking.paidAmount : formData.refundAmount,
    });
  };

  const handleAmountChange = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount >= 0 && numAmount <= booking.paidAmount) {
      setFormData({ ...formData, refundAmount: numAmount });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      return;
    }

    if (formData.refundType === 'partial' && formData.refundAmount <= 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onConfirm(formData);
      onClose();
      // Reset form
      setFormData({
        refundType: 'full',
        refundAmount: booking.paidAmount,
        reason: '',
      });
    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
          <DialogDescription>
            Process a refund for this booking. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Refund Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Customer:</strong> {booking.customerName}</p>
              <p><strong>Service:</strong> {booking.serviceName}</p>
              <p><strong>Paid Amount:</strong> ${booking.paidAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Refund Type Selection */}
          <div className="space-y-2">
            <Label>Refund Type</Label>
            <Select
              value={formData.refundType}
              onValueChange={(value: 'full' | 'partial') => handleRefundTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select refund type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Refund</SelectItem>
                <SelectItem value="partial">Partial Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refund Amount */}
          {formData.refundType === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={booking.paidAmount}
                  value={formData.refundAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-10"
                  placeholder="0.00"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Maximum refundable amount: ${booking.paidAmount.toFixed(2)}
              </p>
            </div>
          )}

          {/* Refund Amount Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Refund Amount:</span>
              <span className="text-lg font-bold text-blue-600">
                ${formData.refundAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Refund Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Refund Reason (Required)</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why this refund is being issued..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Important Warning</p>
                <p>
                  This action will send money back to the customer immediately. 
                  This cannot be undone once processed.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isSubmitting || !formData.reason.trim() || formData.refundAmount <= 0}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

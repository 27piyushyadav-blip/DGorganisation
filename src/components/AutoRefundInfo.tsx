'use client';

import { ArrowRight, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AutoRefundInfoProps {
  customerName: string;
  serviceName: string;
  paidAmount: number;
  cancelledWithin: number;
  bookingDate: string;
  bookingTime: string;
}

export default function AutoRefundInfo({
  customerName,
  serviceName,
  paidAmount,
  cancelledWithin,
  bookingDate,
  bookingTime,
}: AutoRefundInfoProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-800">Auto Refund Processed</h3>
          <Badge className="bg-red-100 text-red-800">Automatic</Badge>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-700">Booking Created</span>
            </div>
            <span className="text-gray-500">{bookingDate} {bookingTime}</span>
          </div>
          
          <div className="flex items-center justify-center py-2">
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-gray-700">Cancelled</span>
            </div>
            <span className="text-gray-500">Within {cancelledWithin} mins</span>
          </div>
          
          <div className="flex items-center justify-center py-2">
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-700">Auto Refunded</span>
            </div>
            <span className="text-green-600 font-medium">${paidAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Refund Amount:</span>
            <span className="font-bold text-green-600">${paidAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-4 p-3 bg-red-100 rounded-lg">
          <div className="flex items-start space-x-2">
            <Clock className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <p className="font-medium mb-1">Why was this refunded automatically?</p>
              <p>
                This booking was cancelled within 3 minutes of creation. 
                According to our policy, payments for bookings cancelled within this timeframe 
                are automatically returned to the customer's original payment method.
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">
            No action required. The customer has been notified of the refund.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

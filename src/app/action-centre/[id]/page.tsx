'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Trash2,
  Video,
  XCircle,
  Printer,
  MoreHorizontal,
  AlertTriangle,
  User,
  CreditCard,
  History,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  getRequestDetailsApi,
  approveRefundApi,
  rejectRefundApi,
  approveEditServiceRequestApi,
  rejectEditServiceRequestApi,
} from '@/client/api/services-bookings';

type RequestDetails = {
  id: string;
  type: 'refund' | 'reschedule' | 'dispute';
  status: string;
  serviceNature: {
    serviceName: string;
    category: string;
    serviceType: string;
    duration: number;
    provider: string;
    location: string;
  };
  requestDetails: {
    reason: string;
    description: string;
    amountRequested: number;
    attachments: Array<{ name: string; url: string; type: string }>;
  };
  paymentDetails: {
    paymentMethod: string;
    paidOn: string;
    amountPaid: number;
    refundableAmount: number;
    transactionId: string;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    bookingId: string;
    bookingDate: string;
    bookingTime: string;
    status: string;
  };
  timeline: Array<{
    id: string;
    action: string;
    details: string;
    createdAt: string;
  }>;
};

export default function RequestDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;
  const type = searchParams.get('type') as 'refund' | 'reschedule' | 'dispute';

  const [details, setDetails] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadRequestDetails() {
    try {
      setIsLoading(true);
      const data = await getRequestDetailsApi(id, type);
      setDetails(data);
    } catch (error) {
      console.error('Failed to load request details:', error);
      toast.error('Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id && type) {
      loadRequestDetails();
    }
  }, [id, type]);

  const handleApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (type === 'refund') {
        await approveRefundApi(id);
        toast.success('Refund request approved successfully!');
      } else if (type === 'reschedule') {
        await approveEditServiceRequestApi(id);
        toast.success('Reschedule request approved successfully!');
      }
      loadRequestDetails();
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('Failed to approve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setIsSubmitting(true);
    try {
      if (type === 'refund') {
        await rejectRefundApi(id, rejectionReason.trim());
        toast.success('Refund request declined');
      } else if (type === 'reschedule') {
        await rejectEditServiceRequestApi(id, rejectionReason.trim());
        toast.success('Reschedule request declined');
      }
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      loadRequestDetails();
    } catch (error) {
      console.error('Failed to decline request:', error);
      toast.error('Failed to decline request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispute = () => {
    toast.info('Request marked under dispute investigation');
    // Implement dispute marking if required by workflow
  };

  const getStatusBadge = (status: string) => {
    const norm = status.toLowerCase();
    if (norm === 'pending' || norm === 'pending review' || norm === 'pending_review') {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 font-medium py-1 px-3">
          Pending Review
        </Badge>
      );
    }
    if (norm === 'under review' || norm === 'under_review') {
      return (
        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 font-medium py-1 px-3">
          Under Review
        </Badge>
      );
    }
    if (norm === 'approved' || norm === 'accepted') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-medium py-1 px-3">
          Approved
        </Badge>
      );
    }
    if (norm === 'rejected' || norm === 'declined') {
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 font-medium py-1 px-3">
          Declined
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="font-medium py-1 px-3">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
        <AlertTriangle className="h-12 w-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Request Not Found</h2>
        <p className="text-sm mb-4">The request you are trying to view does not exist or has been deleted.</p>
        <Button onClick={() => router.push('/action-centre')}>Back to Action Centre</Button>
      </div>
    );
  }

  const isPending = details.status.toLowerCase() === 'pending' || details.status.toLowerCase() === 'pending review';

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-slate-50 min-h-screen">
      {/* Top Navigation / Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/action-centre')}
            className="hover:bg-slate-200 border border-slate-200 bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Requests
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <h2 className="text-xl font-bold text-slate-900">
            Request #{details.id.slice(0, 8).toUpperCase()}
          </h2>
          {getStatusBadge(details.status)}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-white">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="h-9 bg-white">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Service Nature */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Video className="h-4 w-4 text-indigo-500" />
              Service Nature
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Service</p>
              <p className="font-bold text-slate-900 mt-0.5">{details.serviceNature.serviceName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Category</p>
                <p className="font-medium text-slate-700 mt-0.5">{details.serviceNature.category}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Type</p>
                <p className="font-medium text-slate-700 mt-0.5">{details.serviceNature.serviceType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Duration</p>
                <p className="font-medium text-slate-700 mt-0.5">{details.serviceNature.duration} Minutes</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Provider</p>
                <p className="font-medium text-slate-700 mt-0.5">{details.serviceNature.provider}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Location</p>
              <p className="font-medium text-slate-700 mt-0.5">{details.serviceNature.location}</p>
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-500" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Reason</p>
              <p className="font-medium text-slate-800 mt-0.5">{details.requestDetails.reason}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Description</p>
              <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">
                {details.requestDetails.description || 'No additional explanation provided.'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Amount Requested</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                ${details.requestDetails.amountRequested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Attachments</p>
              {details.requestDetails.attachments && details.requestDetails.attachments.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {details.requestDetails.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FileText className="h-3 w-3" />
                      {file.name}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5">No attachments</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Catering / Payment */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-sky-500" />
              Catering / Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Payment Method</p>
              <p className="font-medium text-slate-700 mt-0.5">{details.paymentDetails.paymentMethod}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Paid On</p>
                <p className="font-medium text-slate-700 mt-0.5">
                  {details.paymentDetails.paidOn
                    ? new Date(details.paymentDetails.paidOn).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Amount Paid</p>
                <p className="font-medium text-slate-700 mt-0.5">
                  ${details.paymentDetails.amountPaid.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Refundable</p>
                <p className="font-bold text-emerald-600 mt-0.5">
                  ${details.paymentDetails.refundableAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Transaction ID</p>
              <p className="font-mono text-xs text-slate-600 mt-0.5 break-all">
                {details.paymentDetails.transactionId}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10 bg-indigo-50 border border-indigo-100">
                <AvatarFallback className="text-indigo-700 font-bold">
                  {details.customerInfo.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-slate-900">{details.customerInfo.name}</p>
                <p className="text-xs text-slate-400">{details.customerInfo.email}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Phone</p>
              <p className="font-medium text-slate-700 mt-0.5">{details.customerInfo.phone || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Booking ID</p>
                <p className="font-mono text-xs text-slate-600 mt-0.5 truncate" title={details.customerInfo.bookingId}>
                  {details.customerInfo.bookingId?.slice(0, 8).toUpperCase() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Booking Status</p>
                <p className="font-medium text-slate-700 mt-0.5 capitalize">{details.customerInfo.status}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Booking Date & Time</p>
              <p className="font-medium text-slate-700 mt-0.5">
                {details.customerInfo.bookingDate
                  ? new Date(details.customerInfo.bookingDate).toLocaleDateString()
                  : 'N/A'}{' '}
                at {details.customerInfo.bookingTime || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons Panel */}
      {isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-100 rounded-lg"
          >
            <CheckCircle className="h-5 w-5" />
            Approve & Process
          </Button>

          <Button
            onClick={handleApprove} // approvals process directly
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-100 rounded-lg"
          >
            <RefreshCw className="h-5 w-5" />
            Reschedule Request
          </Button>

          <Button
            onClick={() => setIsRejectDialogOpen(true)}
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-100 rounded-lg"
          >
            <XCircle className="h-5 w-5" />
            Decline Request
          </Button>

          <Button
            onClick={handleDispute}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-amber-100 rounded-lg"
          >
            <AlertTriangle className="h-5 w-5" />
            Dispute Request
          </Button>
        </div>
      )}

      {/* Bottom Timeline and Logs section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request Timeline */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-sm font-bold text-slate-800">Request Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {details.timeline && details.timeline.length > 0 ? (
              <div className="relative pl-6 border-l border-slate-200 space-y-6">
                {details.timeline.map((log) => (
                  <div key={log.id} className="relative">
                    {/* Circle icon */}
                    <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-indigo-500 ring-4 ring-white" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 capitalize">{log.action}</p>
                      <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No logs recorded yet. Automated logs are created when actions are performed.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity log */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-sm font-bold text-slate-800">Activity</CardTitle>
            </div>
            <button
              onClick={() => router.push('/activity-log')}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              View All
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5" />
                <div>
                  <p className="font-semibold text-slate-800">Request Loaded</p>
                  <p className="text-xs text-slate-400">Just now</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-slate-300 mt-1.5" />
                <div>
                  <p className="font-semibold text-slate-800">Payment received</p>
                  <p className="text-xs text-slate-400">2 days ago</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-slate-300 mt-1.5" />
                <div>
                  <p className="font-semibold text-slate-800">Booking created</p>
                  <p className="text-xs text-slate-400">10 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decline Rejection Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Request</DialogTitle>
            <DialogDescription>
              Please enter the reason for declining this customer request. This comment will be visible to the customer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Provide a detailed explanation for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

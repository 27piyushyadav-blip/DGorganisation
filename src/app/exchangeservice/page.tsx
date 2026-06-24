'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CircleDollarSign, Clock3, ShieldAlert, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getEditServiceRequestsApi, approveEditServiceRequestApi, rejectEditServiceRequestApi } from '@/client/api/services-bookings';

type RefundStatus = 'Pending' | 'Accepted' | 'Rejected';

type RefundRequest = {
  id: string;
  clientName: string;
  service: string;
  amount: number;
  reason: string;
  requestedAt: string;
  paymentMethod: string;
  status: RefundStatus;
  rejectionReason?: string;
};

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'AUD',
});

export default function ExchangeServicepage() {
  const router = useRouter();
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    async function fetchEditServiceRequests() {
      try {
        const response = await getEditServiceRequestsApi();
        // Transform API response to match the expected structure
        const transformedRequests = response.map((item: any) => ({
          id: item.editRequest.id,
          clientName: item.client?.name || 'Unknown',
          service: item.editRequest.newService || 'Unknown Service',
          amount: parseFloat(item.editRequest.newAmount) || 0,
          reason: item.editRequest.reason || '',
          requestedAt: new Date(item.editRequest.requestedAt).toLocaleDateString(),
          paymentMethod: 'N/A',
          status: item.editRequest.status.charAt(0).toUpperCase() + item.editRequest.status.slice(1) as RefundStatus,
          rejectionReason: item.editRequest.rejectionReason,
        }));
        setRefundRequests(transformedRequests);
      } catch (error) {
        console.error('Failed to fetch edit service requests:', error);
        toast.error('Failed to load edit service requests');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEditServiceRequests();
  }, []);

  const summary = useMemo(() => {
    const pending = refundRequests.filter((request) => request.status === 'Pending');
    const accepted = refundRequests.filter((request) => request.status === 'Accepted');
    const rejected = refundRequests.filter((request) => request.status === 'Rejected');

    return {
      pendingCount: pending.length,
      approvedAmount: accepted.reduce((sum, request) => sum + request.amount, 0),
      rejectedCount: rejected.length,
      requestedAmount: refundRequests.reduce((sum, request) => sum + request.amount, 0),
    };
  }, [refundRequests]);

  const updateRequestStatus = (id: string, status: Extract<RefundStatus, 'Accepted' | 'Rejected'>) => {
    setRefundRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request))
    );
  };

  const openRejectDialog = (id: string) => {
    setSelectedRejectId(id);
    setRejectReason('');
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRejectId || !rejectReason.trim()) {
      return;
    }

    try {
      await rejectEditServiceRequestApi(selectedRejectId, rejectReason.trim());
      setRefundRequests((current) =>
        current.map((request) =>
          request.id === selectedRejectId
            ? { ...request, status: 'Rejected', rejectionReason: rejectReason.trim() }
            : request
        )
      );
      setIsRejectDialogOpen(false);
      setSelectedRejectId(null);
      setRejectReason('');
      toast.success("Reject Successfully");
    } catch (error) {
      console.error('Failed to reject edit service request:', error);
      toast.error('Failed to reject edit service request');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await approveEditServiceRequestApi(id);
      setRefundRequests((current) =>
        current.map((request) => (request.id === id ? { ...request, status: 'Accepted' } : request))
      );
      toast.success("Edit service request approved successfully");
    } catch (error) {
      console.error('Failed to approve edit service request:', error);
      toast.error('Failed to approve edit service request');
    }
  };

  const getStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case 'Accepted':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Accepted</Badge>;
      case 'Rejected':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 bg-[var(--card-bg-light)] p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Service Requests</h1>
        <p className="text-sm text-slate-500">
          Review client edit service requests and approve or reject them from one table.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl text-amber-700">
              {summary.pendingCount}
              <Clock3 className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Waiting for manual review.</CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription>Approved Edit Service Requests</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl text-emerald-700">
              {summary.approvedAmount}
              <CheckCircle2 className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Total Service Requests already approved.</CardContent>
        </Card>

        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription>Rejected Requests</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl text-rose-700">
              {summary.rejectedCount}
              <XCircle className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Requests marked as ineligible.</CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription>Total Requested</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl text-blue-700">
              {summary.requestedAmount}
              <CircleDollarSign className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Combined ervice across demo records.</CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Client Edit Service Queue</CardTitle>
            <CardDescription>Demo edit service requests listed with quick approval actions.</CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <ShieldAlert className="h-4 w-4" />
            Review policy before accepting high-value edit service requests
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested On</TableHead>
                {/* <TableHead>Payment Method</TableHead> */}
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refundRequests.map((request) => {
                const isResolved = request.status !== 'Pending';

                return (
                  <TableRow key={request.id}>
                   <TableCell className="font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://i.pravatar.cc/150?u=${request.clientName}`}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{request.id}</TableCell>
                    <TableCell>{request.clientName}</TableCell>
                    <TableCell>{request.service}</TableCell>
                    <TableCell className="max-w-xs text-sm text-slate-500">{request.reason}</TableCell>
                    <TableCell>{request.requestedAt}</TableCell>
                    {/* <TableCell>{request.paymentMethod}</TableCell> */}
                    <TableCell className="text-right font-semibold text-slate-800">
                      {currency.format(request.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          disabled={isResolved}
                          onClick={() => handleAccept(request.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          disabled={isResolved}
                          onClick={() => openRejectDialog(request.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isRejectDialogOpen}
        onOpenChange={(open) => {
          setIsRejectDialogOpen(open);
          if (!open) {
            setSelectedRejectId(null);
            setRejectReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Edit Service Request</DialogTitle>
            <DialogDescription>
              Write the reason for rejecting this edit service request before continuing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Rejection reason</p>
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Explain why this edit service request is being rejected..."
              className="min-h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setSelectedRejectId(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={!rejectReason.trim()}
              onClick={handleReject}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

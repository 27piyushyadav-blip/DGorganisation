'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Users,
  Video,
  XCircle,
  Eye,
  ChevronRight,
  Filter,
  ArrowUpDown,
  History,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getActionCentreRequestsApi } from '@/client/api/services-bookings';

type RequestItem = {
  id: string;
  type: 'refund' | 'reschedule' | 'dispute';
  customerName: string;
  customerEmail: string;
  serviceName: string;
  amount: number;
  reason: string;
  requestedOn: string;
  status: string;
  bookingId?: string;
};

type Metrics = {
  totalRequests: number;
  pendingRequests: number;
  rescheduleRequests: number;
  refundRequests: number;
  disputes: number;
  overdue: number;
};

export default function ActionCentrePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalRequests: 0,
    pendingRequests: 0,
    rescheduleRequests: 0,
    refundRequests: 0,
    disputes: 0,
    overdue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getActionCentreRequestsApi();
        setRequests(response.requests || []);
        setMetrics(response.metrics || {
          totalRequests: 0,
          pendingRequests: 0,
          rescheduleRequests: 0,
          refundRequests: 0,
          disputes: 0,
          overdue: 0,
        });
      } catch (error) {
        console.error('Failed to load Action Centre requests:', error);
        toast.error('Failed to load customer requests');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Tab filter
      if (activeTab === 'refund' && req.type !== 'refund') return false;
      if (activeTab === 'reschedule' && req.type !== 'reschedule') return false;
      if (activeTab === 'dispute' && req.type !== 'dispute') return false;
      if (activeTab === 'overdue' && req.status.toLowerCase() !== 'overdue') return false;
      if (activeTab === 'decline' && req.status.toLowerCase() !== 'rejected') return false;

      // 2. Search filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        req.customerName.toLowerCase().includes(term) ||
        req.customerEmail.toLowerCase().includes(term) ||
        req.serviceName.toLowerCase().includes(term) ||
        (req.reason && req.reason.toLowerCase().includes(term)) ||
        (req.bookingId && req.bookingId.toLowerCase().includes(term))
      );
    });
  }, [requests, activeTab, searchTerm]);

  const getRequestTypeBadge = (type: RequestItem['type']) => {
    switch (type) {
      case 'refund':
        return (
          <Badge className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50 font-medium py-1 px-2.5 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
            Refund
          </Badge>
        );
      case 'reschedule':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-medium py-1 px-2.5 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Reschedule
          </Badge>
        );
      case 'dispute':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-medium py-1 px-2.5 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Dispute
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const norm = status.toLowerCase();
    if (norm === 'pending' || norm === 'pending review' || norm === 'pending_review') {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 font-medium py-1 px-2.5">
          Pending Review
        </Badge>
      );
    }
    if (norm === 'under review' || norm === 'under_review') {
      return (
        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 font-medium py-1 px-2.5">
          Under Review
        </Badge>
      );
    }
    if (norm === 'approved' || norm === 'accepted') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-medium py-1 px-2.5">
          Approved
        </Badge>
      );
    }
    if (norm === 'rejected' || norm === 'declined') {
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 font-medium py-1 px-2.5">
          Declined
        </Badge>
      );
    }
    if (norm === 'overdue') {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 font-medium py-1 px-2.5 animate-pulse">
          Overdue
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="font-medium py-1 px-2.5">
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Action Centre</h1>
          <p className="text-slate-500 text-sm">
            All customer requests that need your attention and immediate decision
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Requests
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{metrics.totalRequests}</div>
            <p className="text-xs text-slate-400 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.pendingRequests}</div>
            <p className="text-xs text-slate-400 mt-1">Needs action</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reschedules
            </CardTitle>
            <Calendar className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{metrics.rescheduleRequests}</div>
            <p className="text-xs text-slate-400 mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Refunds
            </CardTitle>
            <DollarSign className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-700">{metrics.refundRequests}</div>
            <p className="text-xs text-slate-400 mt-1">Pending decision</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Disputes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{metrics.disputes}</div>
            <p className="text-xs text-slate-400 mt-1">Under investigation</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overdue
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.overdue}</div>
            <p className="text-xs text-slate-400 mt-1">Not handled yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Request Listing */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-lg w-fit border border-slate-200">
              {[
                { id: 'all', label: `All Requests (${metrics.totalRequests})` },
                { id: 'refund', label: `Refund (${metrics.refundRequests})` },
                { id: 'reschedule', label: `Reschedule (${metrics.rescheduleRequests})` },
                { id: 'dispute', label: `Dispute (${metrics.disputes})` },
                { id: 'decline', label: 'Decline' },
                { id: 'overdue', label: `Overdue (${metrics.overdue})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search/Filter Controls */}
            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 border-slate-200 bg-white shadow-none focus-visible:ring-slate-300"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 border-t border-slate-100">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <FileText className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-semibold text-lg text-slate-700">No requests found</p>
              <p className="text-sm max-w-sm mt-1">
                There are no requests that match your current search terms or selected filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4 pl-6">Customer</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Request Type</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Requested On</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 bg-indigo-50 border border-indigo-100">
                            <AvatarFallback className="text-indigo-700 font-semibold text-xs">
                              {req.customerName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-900 leading-none mb-1">
                              {req.customerName}
                            </p>
                            <p className="text-xs text-slate-400">{req.customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">
                            {req.serviceName}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">{getRequestTypeBadge(req.type)}</td>
                      <td className="p-4">
                        <span className="text-slate-600 line-clamp-1 max-w-[200px]" title={req.reason}>
                          {req.reason}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-950">
                          ${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(req.requestedOn).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })} at {new Date(req.requestedOn).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4">{getStatusBadge(req.status)}</td>
                      <td className="p-4 pr-6 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/action-centre/${req.id}?type=${req.type}`)}
                          className="h-8 text-xs font-semibold border-slate-200 bg-white hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

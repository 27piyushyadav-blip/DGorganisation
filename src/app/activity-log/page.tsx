'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  History,
  Search,
  Filter,
  ArrowRight,
  Clock,
  User,
  Shield,
  Building,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getRequestLogsApi } from '@/client/api/services-bookings';

type RequestLog = {
  id: string;
  requestId: string;
  requestType: 'refund' | 'edit_service' | 'dispute';
  action: string;
  performedBy: 'client' | 'organization' | 'admin';
  actorId?: string;
  details: string;
  metadata?: any;
  createdAt: string;
};

export default function ActivityLogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    async function loadLogs() {
      try {
        const response = await getRequestLogsApi();
        setLogs(response || []);
      } catch (error) {
        console.error('Failed to load activity logs:', error);
        toast.error('Failed to load request activity logs');
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Request Type Filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'refund' && log.requestType !== 'refund') return false;
        if (typeFilter === 'reschedule' && log.requestType !== 'edit_service') return false;
        if (typeFilter === 'dispute' && log.requestType !== 'dispute') return false;
      }

      // 2. Action Filter
      if (actionFilter !== 'all' && log.action.toLowerCase() !== actionFilter.toLowerCase()) {
        return false;
      }

      // 3. Search Filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        log.details.toLowerCase().includes(term) ||
        log.requestId.toLowerCase().includes(term) ||
        log.performedBy.toLowerCase().includes(term)
      );
    });
  }, [logs, typeFilter, actionFilter, searchTerm]);

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act === 'submitted' || act === 'created') {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 border border-blue-200 text-blue-600">
          <FileText className="h-4 w-4" />
        </div>
      );
    }
    if (act === 'approved' || act === 'accepted') {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600">
          <CheckCircle className="h-4 w-4" />
        </div>
      );
    }
    if (act === 'rejected' || act === 'declined') {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 border border-rose-200 text-rose-600">
          <XCircle className="h-4 w-4" />
        </div>
      );
    }
    if (act === 'rescheduled') {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 border border-purple-200 text-purple-600">
          <Calendar className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 border border-amber-200 text-amber-600">
        <AlertTriangle className="h-4 w-4" />
      </div>
    );
  };

  const getPerformedByBadge = (by: RequestLog['performedBy']) => {
    switch (by) {
      case 'client':
        return (
          <Badge className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50 flex items-center gap-1 w-fit text-xs font-semibold py-0.5">
            <User className="h-3 w-3" />
            Client
          </Badge>
        );
      case 'organization':
        return (
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50 flex items-center gap-1 w-fit text-xs font-semibold py-0.5">
            <Building className="h-3 w-3" />
            Business Owner
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100 flex items-center gap-1 w-fit text-xs font-semibold py-0.5">
            <Shield className="h-3 w-3" />
            System Admin
          </Badge>
        );
      default:
        return <Badge variant="outline">{by}</Badge>;
    }
  };

  const getRequestTypeName = (type: RequestLog['requestType']) => {
    if (type === 'edit_service') return 'reschedule';
    return type;
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <History className="h-8 w-8 text-indigo-600" />
          Request Activity Log
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Automatic audit trail for all customer request transitions, status changes, and administrative actions
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search log descriptions or request IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-slate-200 bg-white focus-visible:ring-slate-300"
              />
            </div>

            {/* Type & Action Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">Filters:</span>
              </div>

              {/* Type Select */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 border-slate-200 bg-white text-xs font-semibold">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Request Types</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                  <SelectItem value="reschedule">Reschedules</SelectItem>
                  <SelectItem value="dispute">Disputes</SelectItem>
                </SelectContent>
              </Select>

              {/* Action Select */}
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40 border-slate-200 bg-white text-xs font-semibold">
                  <SelectValue placeholder="Action Done" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs timeline/list */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <History className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-semibold text-lg text-slate-700">No activity logs found</p>
              <p className="text-sm max-w-sm mt-1">
                There are no automated audit logs matching your search queries or selected filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-5 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Action Icon */}
                  <div className="flex-shrink-0 mt-0.5">{getActionIcon(log.action)}</div>

                  {/* Log Content */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                      <p className="text-sm font-bold text-slate-900 break-words leading-snug">
                        {log.details}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getPerformedByBadge(log.performedBy)}
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(log.createdAt).toLocaleDateString()} at{' '}
                          {new Date(log.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                          Request ID:
                        </span>
                        <span className="font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {log.requestId.slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                          Request Type:
                        </span>
                        <span className="font-semibold text-slate-700 capitalize">
                          {getRequestTypeName(log.requestType)}
                        </span>
                      </div>

                      {/* Link to Action Centre Details */}
                      <button
                        onClick={() =>
                          router.push(
                            `/action-centre/${log.requestId}?type=${getRequestTypeName(log.requestType)}`
                          )
                        }
                        className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
                      >
                        Go to Request Details
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

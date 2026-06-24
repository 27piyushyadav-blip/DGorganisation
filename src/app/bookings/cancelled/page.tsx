'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Filter,
  Phone,
  RefreshCw,
  Search,
  Video,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingDown,
  TrendingUp,
  Download,
  AlertCircle,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getOrganizationBookingsApi } from '@/client/api/bookings';

export default function CancelledBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelledBookings, setCancelledBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getOrganizationBookingsApi('cancelled');
      const mapped = (res.bookings || []).map((b: any) => {
        const d = new Date(b.scheduledDate);
        return {
          id: b.id,
          userName: b.clientName || 'Customer',
          clientPhone: b.clientPhone || '+1 234 567 890',
          expertName: b.expertName || 'Expert',
          expertSpecialty: b.expertSpecialty || 'Therapy',
          date: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }),
          time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          duration: `${b.duration || 60} mins`,
          type: b.type || 'online',
          status: b.status,
          amount: b.amount ? (b.amount.startsWith('$') ? b.amount : `$${b.amount}`) : '$0',
          userAvatar: b.userAvatar || '',
          expertAvatar: b.expertAvatar || '',
          cancelReason: b.cancellationReason || b.rejectionReason || 'Customer unavailable',
          cancelledAt: b.cancelledAt ? new Date(b.cancelledAt).toLocaleString(undefined, {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) : d.toLocaleString(undefined, {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          refundStatus: b.paymentStatus === 'refunded' ? 'Full' : b.paymentStatus === 'partial' ? 'Partial' : 'No Refund',
          service: b.service || 'Deep Tissue Massage',
        };
      });
      setCancelledBookings(mapped);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load cancelled bookings');
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

  const filteredBookings = cancelledBookings.filter((booking) => {
    const search = searchTerm.toLowerCase();
    return (
      booking.userName.toLowerCase().includes(search) ||
      booking.expertName.toLowerCase().includes(search) ||
      booking.cancelReason.toLowerCase().includes(search) ||
      booking.id.toLowerCase().includes(search)
    );
  });

  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  // Aggregated Stats
  const canceledTodayCount = cancelledBookings.filter(b => {
    const today = new Date().toDateString();
    return new Date(b.cancelledAt).toDateString() === today;
  }).length;

  const canceledThisWeekCount = cancelledBookings.length;

  const refundsIssued = cancelledBookings
    .filter(b => b.refundStatus === 'Full' || b.refundStatus === 'Partial')
    .reduce((sum, b) => {
      const val = parseFloat(b.amount.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

  const lostRevenue = cancelledBookings.reduce((sum, b) => {
    const val = parseFloat(b.amount.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const getRefundBadge = (status: string) => {
    switch (status) {
      case 'Full':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 font-semibold px-2 py-0.5 rounded-md text-xs border uppercase tracking-wider">
            Full
          </Badge>
        );
      case 'Partial':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-semibold px-2 py-0.5 rounded-md text-xs border uppercase tracking-wider">
            Partial
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 font-semibold px-2 py-0.5 rounded-md text-xs border uppercase tracking-wider">
            No Refund
          </Badge>
        );
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cancelled</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View all cancelled bookings
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
            placeholder="Search cancelled bookings..."
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
        {/* Canceled Today */}
        <Card className="flex items-center p-4 bg-white border-gray-100 shadow-sm">
          <div className="p-3 rounded-lg bg-red-50 text-red-600 mr-4">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Canceled Today</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{canceledTodayCount}</h3>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1" /> -25% from yesterday
            </p>
          </div>
        </Card>

        {/* Canceled This Week */}
        <Card className="flex items-center p-4 bg-white border-gray-100 shadow-sm">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600 mr-4">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Canceled This Week</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{canceledThisWeekCount}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +10% from last week
            </p>
          </div>
        </Card>

        {/* Refunds Issued */}
        <Card className="flex items-center p-4 bg-white border-gray-100 shadow-sm">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Refunds Issued</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">${refundsIssued.toLocaleString()}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +18% from last week
            </p>
          </div>
        </Card>

        {/* Lost Revenue */}
        <Card className="flex items-center p-4 bg-white border-gray-100 shadow-sm">
          <div className="p-3 rounded-lg bg-red-50 text-red-600 mr-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lost Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">${lostRevenue.toLocaleString()}</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from last week
            </p>
          </div>
        </Card>
      </div>

      {/* Cancelled Bookings Table */}
      {filteredBookings.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold">
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Customer</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Expert</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Service & Duration</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Cancelled On</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Reason</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Amount</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Refund</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBookings.map((booking) => (
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
                      <div className="font-semibold text-gray-900">{booking.service}</div>
                      <div className="text-xs text-muted-foreground">{booking.duration}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{booking.cancelledAt}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {booking.cancelReason}
                  </td>
                  <td className="p-4 font-semibold text-gray-900">
                    {booking.amount}
                  </td>
                  <td className="p-4">
                    {getRefundBadge(booking.refundStatus)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-gray-700 hover:bg-gray-50 font-semibold h-8 rounded-md px-3 border-gray-200"
                        onClick={() => alert(`Showing details for booking ${booking.id}...`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-gray-700 hover:bg-gray-50 font-semibold h-8 rounded-md px-3 border-gray-200"
                        onClick={() => alert(`Downloading refund receipt for booking ${booking.id}...`)}
                      >
                        Refund Receipt
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-gray-700 hover:bg-gray-50 font-semibold h-8 rounded-md px-3 border-gray-200"
                        onClick={() => alert(`Opening contact channel with customer ${booking.userName}...`)}
                      >
                        Contact
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
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cancelled Bookings</h3>
            <p className="text-muted-foreground text-center mb-4">
              There are no cancelled bookings at the moment.
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
    </div>
  );
}

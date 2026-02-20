'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Calendar, User, DollarSign } from 'lucide-react';

export default function RefundLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const refundLogs = [
    {
      id: 'RF001',
      date: '2024-02-20',
      time: '14:30:22',
      ticketId: 'D1023',
      bookingId: 'B4589',
      customer: 'Sarah Lee',
      expert: 'Akan',
      amount: 300,
      status: 'Completed',
      type: 'Manual Refund',
      reason: 'Service refund due to expert unavailability',
      initiatedBy: 'Admin',
      stripeRefundId: 're_1234567890',
      processedDate: '2024-02-20',
      processingTime: '2 hours 15 minutes'
    },
    {
      id: 'RF002',
      date: '2024-02-19',
      time: '09:15:45',
      ticketId: 'D1024',
      bookingId: 'B4590',
      customer: 'John Smith',
      expert: 'Suraj',
      amount: 200,
      status: 'Completed',
      type: 'Auto Refund',
      reason: 'Booking cancelled within 3 minutes',
      initiatedBy: 'System',
      stripeRefundId: 're_1234567891',
      processedDate: '2024-02-19',
      processingTime: '5 minutes'
    },
    {
      id: 'RF003',
      date: '2024-02-18',
      time: '16:45:12',
      ticketId: 'D1025',
      bookingId: 'B4591',
      customer: 'Emma Wilson',
      expert: 'Mehta',
      amount: 150,
      status: 'Processing',
      type: 'Manual Refund',
      reason: 'Customer requested cancellation',
      initiatedBy: 'Admin',
      stripeRefundId: 'pending',
      processedDate: null,
      processingTime: 'In progress'
    },
    {
      id: 'RF004',
      date: '2024-02-17',
      time: '11:20:33',
      ticketId: 'D1026',
      bookingId: 'B4592',
      customer: 'Michael Brown',
      expert: 'Manav',
      amount: 400,
      status: 'Failed',
      type: 'Manual Refund',
      reason: 'Service could not be provided',
      initiatedBy: 'Admin',
      stripeRefundId: 'failed',
      processedDate: '2024-02-17',
      processingTime: '1 hour'
    },
    {
      id: 'RF005',
      date: '2024-02-16',
      time: '13:10:15',
      ticketId: 'D1027',
      bookingId: 'B4593',
      customer: 'Lisa Davis',
      expert: 'Akan',
      amount: 250,
      status: 'Completed',
      type: 'Manual Refund',
      reason: 'Rescheduled to different expert',
      initiatedBy: 'Customer',
      stripeRefundId: 're_1234567892',
      processedDate: '2024-02-16',
      processingTime: '30 minutes'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Auto Refund':
        return 'bg-purple-100 text-purple-800';
      case 'Manual Refund':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Processing':
        return <Clock className="h-4 w-4" />;
      case 'Failed':
        return <XCircle className="h-4 w-4" />;
      case 'Pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredRefunds = refundLogs.filter(refund => {
    const matchesSearch = refund.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    const matchesType = typeFilter === 'all' || refund.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Refund Logs</h1>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, ticket, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Manual Refund">Manual Refund</SelectItem>
                <SelectItem value="Auto Refund">Auto Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refundLogs.length}</div>
            <p className="text-xs text-muted-foreground">All refunds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {refundLogs.filter(r => r.status === 'Completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {refundLogs.filter(r => r.status === 'Processing').length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${refundLogs.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Refunded amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Refund History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Refund ID</th>
                  <th className="text-left p-3">Date & Time</th>
                  <th className="text-left p-3">Ticket</th>
                  <th className="text-left p-3">Booking</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Expert</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Type</th>
                  <th className="text-left p-3">Reason</th>
                  <th className="text-left p-3">Initiated By</th>
                  <th className="text-left p-3">Stripe ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{refund.id}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{refund.date}</div>
                        <div className="text-sm text-muted-foreground">{refund.time}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{refund.ticketId}</td>
                    <td className="p-3 font-mono">{refund.bookingId}</td>
                    <td className="p-3">{refund.customer}</td>
                    <td className="p-3">{refund.expert}</td>
                    <td className="p-3 text-right font-bold text-red-600">${refund.amount}</td>
                    <td className="p-3 text-center">
                      <Badge className={getStatusColor(refund.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(refund.status)}
                          <span>{refund.status}</span>
                        </span>
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={getTypeColor(refund.type)}>
                        {refund.type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs truncate" title={refund.reason}>
                        {refund.reason}
                      </div>
                    </td>
                    <td className="p-3">{refund.initiatedBy}</td>
                    <td className="p-3 font-mono text-sm">
                      {refund.stripeRefundId === 'pending' ? (
                        <Badge variant="outline">Pending</Badge>
                      ) : refund.stripeRefundId === 'failed' ? (
                        <Badge variant="destructive">Failed</Badge>
                      ) : (
                        refund.stripeRefundId
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRefunds.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No refund records found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Refund Types Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Refund Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Manual Refund</p>
                  <p className="text-sm text-muted-foreground">
                    Processed by admin when service cannot be provided or customer requests cancellation.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Auto Refund</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically processed when booking is cancelled within 3 minutes of payment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Auto Refunds</p>
                  <p className="text-sm text-muted-foreground">Processed immediately (5 minutes)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Manual Refunds</p>
                  <p className="text-sm text-muted-foreground">Processed within 2-4 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Failed Refunds</p>
                  <p className="text-sm text-muted-foreground">Require manual intervention</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

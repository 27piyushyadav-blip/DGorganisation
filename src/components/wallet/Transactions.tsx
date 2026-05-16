'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, CreditCard, ArrowUpDown } from 'lucide-react';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const transactions = [
    { id: 'TXN001', date: '2024-02-20', customer: 'Sarah Lee', service: 'Digital Consultation', amount: 300, status: 'Available', type: 'Credit', reference: 'BK001' },
    { id: 'TXN002', date: '2024-02-20', customer: 'John Smith', service: 'Health Assessment', amount: 200, status: 'Pending', type: 'Credit', reference: 'BK002' },
    { id: 'TXN003', date: '2024-02-19', customer: 'Emma Wilson', service: 'Wellness Check', amount: 150, status: 'Refunded', type: 'Refund', reference: 'BK003' },
    { id: 'TXN004', date: '2024-02-19', customer: 'Michael Brown', service: 'Mental Health Session', amount: 400, status: 'Available', type: 'Credit', reference: 'BK004' },
    { id: 'TXN005', date: '2024-02-18', customer: 'Lisa Davis', service: 'Nutrition Planning', amount: 250, status: 'Withdrawn', type: 'Withdrawal', reference: 'WD001' },
    { id: 'TXN006', date: '2024-02-18', customer: 'David Johnson', service: 'Physical Therapy', amount: 350, status: 'Available', type: 'Credit', reference: 'BK005' },
    { id: 'TXN007', date: '2024-02-17', customer: 'Jennifer White', service: 'Mental Health Session', amount: 300, status: 'Auto Refunded', type: 'Refund', reference: 'BK006' },
    { id: 'TXN008', date: '2024-02-17', customer: 'Robert Taylor', service: 'Digital Consultation', amount: 200, status: 'On Hold', type: 'Credit', reference: 'BK007' },
    { id: 'TXN009', date: '2024-02-16', customer: 'Maria Garcia', service: 'Health Assessment', amount: 180, status: 'Available', type: 'Credit', reference: 'BK008' },
    { id: 'TXN010', date: '2024-02-16', customer: 'James Miller', service: 'Wellness Check', amount: 120, status: 'Withdrawn', type: 'Withdrawal', reference: 'WD002' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Refunded':
        return 'bg-red-100 text-red-800';
      case 'Auto Refunded':
        return 'bg-orange-100 text-orange-800';
      case 'Withdrawn':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Credit':
        return 'text-green-600';
      case 'Refund':
        return 'text-red-600';
      case 'Withdrawal':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
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
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, service, or transaction ID..."
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
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
                <SelectItem value="Auto Refunded">Auto Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Refund">Refund</SelectItem>
                <SelectItem value="Withdrawal">Withdrawal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--primary-start)]">
                  <th className="text-left p-3">Transaction ID</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Service</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Type</th>
                  <th className="text-left p-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-[var(--primary-start)] hover:bg-[var(--card-bg-light)]">
                    <td className="p-3 font-medium">{transaction.id}</td>
                    <td className="p-3">{transaction.date}</td>
                    <td className="p-3">{transaction.customer}</td>
                    <td className="p-3">{transaction.service}</td>
                    <td className={`p-3 text-right font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'Credit' ? '+' : transaction.type === 'Refund' ? '-' : ''}
                      ${transaction.amount}
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className={`p-3 text-center font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </td>
                    <td className="p-3">{transaction.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

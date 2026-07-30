'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, ArrowUpDown } from 'lucide-react';
import { apiClient } from '@/client/api/api-client';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const data = await apiClient<any>(`${API_BASE}/organizations/wallet/transactions?limit=100`);
      
      if (data && Array.isArray(data.transactions)) {
        setTransactions(
          data.transactions.map((t: any) => ({
            id: `TXN-${t.id.slice(0, 5).toUpperCase()}`,
            rawId: t.id,
            date: new Date(t.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            customer: t.clientName || 'N/A',
            service: t.service || t.description || 'Consultation',
            amount: Number(t.netAmount),
            status: t.status === 'completed' ? 'Available' : t.status === 'pending' ? 'Pending' : t.status,
            type: t.type === 'session_payment' ? 'Credit' : t.type === 'refund' ? 'Refund' : t.type === 'payout' ? 'Withdrawal' : t.type,
            reference: t.bookingId ? `BK-${t.bookingId.slice(0, 5).toUpperCase()}` : 'N/A',
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Pending':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Refunded':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Withdrawn':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
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
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExport = () => {
    const headers = ['Transaction ID', 'Date', 'Customer', 'Service', 'Amount', 'Status', 'Type', 'Reference'];
    const rows = filteredTransactions.map(t => [
      t.id, t.date, t.customer, t.service, t.amount, t.status, t.type, t.reference
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `organization_transactions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-[var(--card-bg-light)] min-h-screen">
        <p className="text-muted-foreground animate-pulse text-lg font-medium">Loading Transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport} className="flex items-center space-x-2">
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--primary-start)] text-muted-foreground">
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
                  <tr key={transaction.rawId} className="border-b border-[var(--primary-start)] hover:bg-[var(--card-bg-light)]">
                    <td className="p-3 font-medium">{transaction.id}</td>
                    <td className="p-3">{transaction.date}</td>
                    <td className="p-3">{transaction.customer}</td>
                    <td className="p-3">{transaction.service}</td>
                    <td className={`p-3 text-right font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}
                      ${transaction.amount.toFixed(2)}
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

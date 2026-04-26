'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, ArrowUpDown, CreditCard, Wallet } from 'lucide-react';

export default function WalletDashboard() {
  const [stats] = useState({
    walletBalance: 5000,
    pendingAmount: 1200,
    withdrawableAmount: 3800,
    totalEarned: 15000,
    totalRefunded: 2000,
  });

  const recentTransactions = [
    { id: 1, customer: 'Sarah Lee', service: 'Digital Consultation', amount: 300, status: 'Available', type: 'Credit' },
    { id: 2, customer: 'John Smith', service: 'Health Assessment', amount: 200, status: 'Pending', type: 'Credit' },
    { id: 3, customer: 'Emma Wilson', service: 'Wellness Check', amount: 150, status: 'Refunded', type: 'Refund' },
    { id: 4, customer: 'Michael Brown', service: 'Mental Health Session', amount: 400, status: 'Available', type: 'Credit' },
    { id: 5, customer: 'Lisa Davis', service: 'Nutrition Planning', amount: 250, status: 'Withdrawn', type: 'Withdrawal' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Refunded':
        return 'bg-red-100 text-red-800';
      case 'Withdrawn':
        return 'bg-blue-100 text-blue-800';
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

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet Overview</h1>
        <div className="flex space-x-3">
          <Button className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4" />
            <span>Withdraw Funds</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>View Transactions</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.walletBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total in wallet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">On hold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available to Withdraw</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.withdrawableAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats.totalRefunded.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Refunded amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--primary-start)]">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Service</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-center p-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-[var(--primary-start)] hover:bg-[var(--card-bg-light)]">
                    <td className="p-2">Today</td>
                    <td className="p-2">{transaction.customer}</td>
                    <td className="p-2">{transaction.service}</td>
                    <td className={`p-2 text-right font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'Credit' ? '+' : transaction.type === 'Refund' ? '-' : ''}
                      ${transaction.amount}
                    </td>
                    <td className="p-2 text-center">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className={`p-2 text-center font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

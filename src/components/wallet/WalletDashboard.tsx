'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, ArrowUpDown, CreditCard, Wallet } from 'lucide-react';
import { apiClient } from '@/client/api/api-client';

export default function WalletDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    walletBalance: 0,
    pendingAmount: 0,
    withdrawableAmount: 0,
    totalEarned: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const [summary, txns] = await Promise.all([
        apiClient<any>(`${API_BASE}/organizations/wallet/summary`),
        apiClient<any>(`${API_BASE}/organizations/wallet/transactions?limit=5`),
      ]);

      const available = Number(summary.availableBalance) || 0;
      const pending = Number(summary.onHoldAmount) || 0;

      setStats({
        walletBalance: available + pending,
        pendingAmount: pending,
        withdrawableAmount: available,
        totalEarned: Number(summary.totalEarnings) || 0,
      });

      if (txns && Array.isArray(txns.transactions)) {
        setRecentTransactions(
          txns.transactions.map((t: any) => ({
            id: `TXN-${t.id.slice(0, 5).toUpperCase()}`,
            rawId: t.id,
            customer: t.clientName || 'N/A',
            service: t.service || t.description || 'Consultation',
            amount: Number(t.netAmount),
            status: t.status === 'completed' ? 'Available' : t.status === 'pending' ? 'Pending' : t.status,
            type: t.type === 'session_payment' ? 'Credit' : t.type === 'refund' ? 'Refund' : t.type === 'payout' ? 'Withdrawal' : t.type,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-[var(--card-bg-light)] min-h-screen">
        <p className="text-muted-foreground animate-pulse text-lg font-medium">Loading Overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet Overview</h1>
        <div className="flex space-x-3">
          <Button onClick={() => router.push('/wallet/withdraw')} className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4" />
            <span>Withdraw Funds</span>
          </Button>
          <Button variant="outline" onClick={() => router.push('/wallet/transactions')} className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>View Transactions</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Total in wallet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">On hold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available to Withdraw</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.withdrawableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Ready for transfer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${stats.totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Net lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => router.push('/wallet/transactions')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--primary-start)] text-muted-foreground text-left">
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Service</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.rawId} className="border-b border-[var(--primary-start)] hover:bg-[var(--card-bg-light)]">
                    <td className="p-3 font-medium">{transaction.id}</td>
                    <td className="p-3">{transaction.customer}</td>
                    <td className="p-3">{transaction.service}</td>
                    <td className={`p-3 text-right font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className={`p-3 text-center font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentTransactions.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No recent transactions.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, ArrowUpDown, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '@/client/api/api-client';

export default function WalletPage() {
  const router = useRouter();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [walletData, setWalletData] = useState<{
    availableBalance: number;
    onHoldAmount: number;
    totalEarnings: number;
    lastWithdrawal: string;
    bankAccount: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      bsbCode?: string;
      ifscCode?: string;
    } | null;
  }>({
    availableBalance: 0,
    onHoldAmount: 0,
    totalEarnings: 0,
    lastWithdrawal: 'N/A',
    bankAccount: null,
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchWalletDetails = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const [summary, txns] = await Promise.all([
        apiClient<any>(`${API_BASE}/organizations/wallet/summary`),
        apiClient<any>(`${API_BASE}/organizations/wallet/transactions?limit=5`),
      ]);

      let formattedLastWithdrawal = 'N/A';
      if (summary.lastWithdrawal && summary.lastWithdrawal !== 'N/A') {
        const d = new Date(summary.lastWithdrawal);
        if (!isNaN(d.getTime())) {
          formattedLastWithdrawal = d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }
      }

      setWalletData({
        availableBalance: Number(summary.availableBalance) || 0,
        onHoldAmount: Number(summary.onHoldAmount) || 0,
        totalEarnings: Number(summary.totalEarnings) || 0,
        lastWithdrawal: formattedLastWithdrawal,
        bankAccount: summary.bankAccount || null,
      });

      if (txns && Array.isArray(txns.transactions)) {
        setRecentTransactions(
          txns.transactions.map((t: any) => ({
            id: t.id,
            type: t.type === 'session_payment' ? 'payment' : t.type,
            description: t.description || 'Transaction',
            amount: Number(t.netAmount),
            date: new Date(t.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            status: t.status,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    setIsWithdrawing(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      await apiClient(`${API_BASE}/organizations/wallet/withdraw`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) }),
      });

      setWithdrawAmount('');
      setIsWithdrawModalOpen(false);
      alert('Withdrawal processed successfully!');
      setLoading(true);
      await fetchWalletDetails();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      alert(error.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getTransactionBadge = (type: string, status: string) => {
    if (status === 'pending') {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>;
    }

    switch (type) {
      case 'payment':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Payment</Badge>;
      case 'refund':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Refund</Badge>;
      case 'withdrawal':
      case 'payout':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Withdrawal</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--card-bg-light)] min-h-screen">
        <p className="text-muted-foreground animate-pulse text-lg font-medium">Loading Wallet...</p>
      </div>
    );
  }

  const hasBankDetails = walletData.bankAccount && walletData.bankAccount.accountNumber;

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your earnings, withdrawals, and bank account
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Available Balance</CardTitle>
            <DollarSign className="text-green-600 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">
              ${walletData.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-green-600 text-xs">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">On Hold Amount</CardTitle>
            <AlertCircle className="text-orange-600 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">
              ${walletData.onHoldAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-orange-600 text-xs">Pending completion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Earnings</CardTitle>
            <CheckCircle className="text-blue-600 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">
              ${walletData.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-blue-600 text-xs">All time net earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Last Withdrawal</CardTitle>
            <ArrowUpDown className="text-purple-600 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {walletData.lastWithdrawal}
            </div>
            <p className="text-purple-600 text-xs">Previous withdrawal date</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Withdraw Funds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold">Available for Withdrawal</h3>
              <p className="text-sm text-gray-600">
                Funds will be transferred to your registered bank account
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${walletData.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <Button 
                onClick={() => {
                  setWithdrawAmount(walletData.availableBalance.toString());
                  setIsWithdrawModalOpen(true);
                }}
                disabled={!hasBankDetails || walletData.availableBalance <= 0}
                className="mt-2"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            </div>
          </div>

          {/* Bank Account Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Bank Account</h4>
            {hasBankDetails ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Bank:</strong> {walletData.bankAccount?.bankName || 'N/A'}</p>
                <p><strong>Account Holder:</strong> {walletData.bankAccount?.accountName || 'N/A'}</p>
                <p><strong>Account Number:</strong> {walletData.bankAccount?.accountNumber ? '****' + walletData.bankAccount.accountNumber.slice(-4) : 'N/A'}</p>
                <p><strong>BSB / IFSC:</strong> {walletData.bankAccount?.bsbCode || walletData.bankAccount?.ifscCode || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-sm text-orange-600 font-medium my-2">
                No bank account registered. Please set up your bank details to enable withdrawals.
              </p>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => router.push('/bank-details')}
            >
              Update Bank Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/wallet/transactions')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-[var(--primary-start)] rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getTransactionBadge(transaction.type, transaction.status)}
                      <span className="text-sm text-gray-500">{transaction.date}</span>
                    </div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No transactions recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Modal */}
      {hasBankDetails && (
        <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Enter the amount you want to withdraw to your bank account.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Withdrawal Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="withdrawAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={walletData.availableBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Maximum: ${walletData.availableBalance.toFixed(2)}
                </p>
              </div>

              {/* Bank Account Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Funds will be sent to:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Bank:</strong> {walletData.bankAccount?.bankName || 'N/A'}</p>
                  <p><strong>Account:</strong> ****{walletData.bankAccount?.accountNumber?.slice(-4)}</p>
                  <p><strong>Holder:</strong> {walletData.bankAccount?.accountName}</p>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsWithdrawModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                >
                  {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

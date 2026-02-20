'use client';

import { useState } from 'react';

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

export default function WalletPage() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Sample data - in real app this would come from API
  const walletData = {
    availableBalance: 8750.00,
    onHoldAmount: 1250.00,
    totalEarnings: 10000.00,
    lastWithdrawal: '2024-02-15',
    bankAccount: {
      bankName: 'Commonwealth Bank',
      accountNumber: '****1234',
      bsb: '063-000',
    },
  };

  const recentTransactions = [
    {
      id: 1,
      type: 'payment',
      description: 'Health Consultation - Sarah Johnson',
      amount: 150.00,
      date: '2024-02-20',
      status: 'completed',
    },
    {
      id: 2,
      type: 'refund',
      description: 'Refund - Michael Brown',
      amount: -100.00,
      date: '2024-02-19',
      status: 'completed',
    },
    {
      id: 3,
      type: 'withdrawal',
      description: 'Bank Transfer',
      amount: -2000.00,
      date: '2024-02-15',
      status: 'completed',
    },
    {
      id: 4,
      type: 'payment',
      description: 'Mental Health Session - Robert Davis',
      amount: 200.00,
      date: '2024-02-18',
      status: 'pending',
    },
  ];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form and close modal
      setWithdrawAmount('');
      setIsWithdrawModalOpen(false);
      
      // Show success message (in real app, you'd use a toast notification)
      alert('Withdrawal processed successfully!');
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getTransactionBadge = (type: string, status: string) => {
    if (status === 'pending') {
      return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
    }

    switch (type) {
      case 'payment':
        return <Badge className="bg-green-100 text-green-800">Payment</Badge>;
      case 'refund':
        return <Badge className="bg-red-100 text-red-800">Refund</Badge>;
      case 'withdrawal':
        return <Badge className="bg-blue-100 text-blue-800">Withdrawal</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
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
              ${walletData.availableBalance.toLocaleString()}
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
              ${walletData.onHoldAmount.toLocaleString()}
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
              ${walletData.totalEarnings.toLocaleString()}
            </div>
            <p className="text-blue-600 text-xs">All time earnings</p>
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
                ${walletData.availableBalance.toLocaleString()}
              </div>
              <Button 
                onClick={() => {
                  setWithdrawAmount(walletData.availableBalance.toString());
                  setIsWithdrawModalOpen(true);
                }}
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
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Bank:</strong> {walletData.bankAccount.bankName}</p>
              <p><strong>Account:</strong> {walletData.bankAccount.accountNumber}</p>
              <p><strong>BSB:</strong> {walletData.bankAccount.bsb}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              Update Bank Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {getTransactionBadge(transaction.type, transaction.status)}
                    <span className="text-sm text-gray-500">{transaction.date}</span>
                  </div>
                  <p className="font-medium">{transaction.description}</p>
                </div>
                <div className={`text-lg font-bold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Transactions
          </Button>
        </CardContent>
      </Card>

      {/* Withdraw Modal */}
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
                <p><strong>Bank:</strong> {walletData.bankAccount.bankName}</p>
                <p><strong>Account:</strong> {walletData.bankAccount.accountNumber}</p>
                <p><strong>BSB:</strong> {walletData.bankAccount.bsb}</p>
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
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function Withdraw() {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data
  const walletStats = {
    availableBalance: 3800,
    pendingAmount: 1200,
    totalBalance: 5000,
  };

  const recentWithdrawals = [
    { id: 'WD001', amount: 1500, date: '2024-02-15', status: 'Completed', bankAccount: '****1234' },
    { id: 'WD002', amount: 800, date: '2024-02-10', status: 'Completed', bankAccount: '****1234' },
    { id: 'WD003', amount: 2000, date: '2024-02-05', status: 'Processing', bankAccount: '****1234' },
    { id: 'WD004', amount: 500, date: '2024-02-01', status: 'Completed', bankAccount: '****1234' },
  ];

  const bankDetails = {
    accountHolderName: 'Digital Health Organization',
    accountNumber: '****1234',
    bsbNumber: '***-062',
    abnNumber: '****-12345',
    bankName: 'Commonwealth Bank',
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > walletStats.availableBalance) {
      alert('Insufficient available balance');
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setWithdrawAmount('');
      alert('Withdrawal request submitted successfully!');
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
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
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Withdraw Funds</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdraw Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Available Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Available to Withdraw:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${walletStats.availableBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Pending Amount:</span>
                  <span>${walletStats.pendingAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-[var(--primary-start)] pt-4"></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Balance:</span>
                  <span className="text-xl font-bold">${walletStats.totalBalance.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Withdraw ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={walletStats.availableBalance}
                />
                <p className="text-sm text-muted-foreground">
                  Minimum withdrawal: $10 | Maximum: ${walletStats.availableBalance.toLocaleString()}
                </p>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Funds will be transferred to your registered bank account within 3-5 business days.
                </p>
              </div>

              <Button 
                onClick={handleWithdraw}
                disabled={isProcessing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="w-full flex items-center space-x-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>{isProcessing ? 'Processing...' : 'Withdraw Funds'}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Holder:</span>
                  <span className="font-medium">{bankDetails.accountHolderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-medium">{bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-medium">{bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BSB Number:</span>
                  <span className="font-medium">{bankDetails.bsbNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ABN Number:</span>
                  <span className="font-medium">{bankDetails.abnNumber}</span>
                </div>
                <div className="pt-3">
                  <Button variant="outline" size="sm">
                    Update Bank Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Withdrawals */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="border border-[var(--primary-start)] rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{withdrawal.id}</p>
                        <p className="text-sm text-muted-foreground">{withdrawal.date}</p>
                      </div>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(withdrawal.status)}
                          <span>{withdrawal.status}</span>
                        </span>
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">to {withdrawal.bankAccount}</span>
                      <span className="font-bold">${withdrawal.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processing Time Info */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Standard Processing</p>
                  <p className="text-sm text-muted-foreground">3-5 business days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Processing Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri, 9 AM - 5 PM AEST</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Minimum Amount</p>
                  <p className="text-sm text-muted-foreground">$10 per withdrawal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

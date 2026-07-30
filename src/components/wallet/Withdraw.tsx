'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, DollarSign, AlertCircle, CheckCircle, Clock, CreditCard, Building2 } from 'lucide-react';
import { apiClient } from '@/client/api/api-client';

export default function Withdraw() {
  const router = useRouter();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [walletStats, setWalletStats] = useState<{
    availableBalance: number;
    pendingAmount: number;
    totalBalance: number;
  }>({
    availableBalance: 0,
    pendingAmount: 0,
    totalBalance: 0,
  });

  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);

  const [bankDetails, setBankDetails] = useState<{
    accountHolderName?: string;
    accountNumber?: string;
    bsbNumber?: string;
    abnNumber?: string;
    bankName?: string;
  } | null>(null);

  const [stripeStatus, setStripeStatus] = useState<{
    onboarded: boolean;
    accountId: string | null;
  }>({
    onboarded: false,
    accountId: null,
  });

  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'stripe_connect'>('bank_transfer');

  const fetchWithdrawalData = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const [summary, payoutsData, stripeRes] = await Promise.all([
        apiClient<any>(`${API_BASE}/organizations/wallet/summary`),
        apiClient<any>(`${API_BASE}/organizations/wallet/payouts`),
        apiClient<any>(`${API_BASE}/organizations/wallet/stripe-connect/status`),
      ]);

      const available = Number(summary.availableBalance) || 0;
      const pending = Number(summary.onHoldAmount) || 0;

      setWalletStats({
        availableBalance: available,
        pendingAmount: pending,
        totalBalance: available + pending,
      });

      if (summary.bankAccount) {
        setBankDetails({
          accountHolderName: summary.bankAccount.accountName || 'N/A',
          accountNumber: summary.bankAccount.accountNumber ? '****' + summary.bankAccount.accountNumber.slice(-4) : 'N/A',
          bsbNumber: summary.bankAccount.bsbCode || summary.bankAccount.ifscCode || 'N/A',
          abnNumber: summary.bankAccount.abn || 'N/A',
          bankName: summary.bankAccount.bankName || 'N/A',
        });
      }

      if (stripeRes) {
        setStripeStatus({
          onboarded: stripeRes.onboarded,
          accountId: stripeRes.accountId,
        });
        if (stripeRes.onboarded) {
          setPayoutMethod('stripe_connect');
        }
      }

      if (payoutsData && Array.isArray(payoutsData.payouts)) {
        setRecentWithdrawals(
          payoutsData.payouts.map((p: any) => ({
            id: `WD-${p.id.slice(0, 5).toUpperCase()}`,
            amount: p.amount,
            date: new Date(p.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            status: p.status === 'processing' ? 'Processing' : p.status === 'completed' ? 'Completed' : 'Failed',
            method: p.method === 'stripe_connect' ? 'Instant Stripe Connect' : 'Bank Transfer',
            bankAccount: p.bankAccount || '****',
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching withdrawal page data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (amount > walletStats.availableBalance) {
      alert('Insufficient available balance');
      return;
    }

    if (amount < 10) {
      alert('Minimum withdrawal amount is $10');
      return;
    }

    setIsProcessing(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      await apiClient(`${API_BASE}/organizations/wallet/withdraw`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });

      setWithdrawAmount('');
      alert(payoutMethod === 'stripe_connect' ? 'Instant Stripe Transfer processed successfully!' : 'Withdrawal request submitted successfully!');
      setLoading(true);
      await fetchWithdrawalData();
    } catch (error: any) {
      console.error('Withdrawal request failed:', error);
      alert(error.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-[var(--card-bg-light)] min-h-screen">
        <p className="text-muted-foreground animate-pulse text-lg font-medium">Loading Withdrawals...</p>
      </div>
    );
  }

  const hasBankDetails = bankDetails && bankDetails.accountNumber && bankDetails.accountNumber !== 'N/A';
  const hasPayoutMethod = stripeStatus.onboarded || hasBankDetails;

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
                    ${walletStats.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Pending Amount:</span>
                  <span>${walletStats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-[var(--primary-start)] pt-4"></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Balance:</span>
                  <span className="text-xl font-bold">${walletStats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
              {stripeStatus.onboarded && (
                <div className="space-y-2">
                  <Label>Payout Method</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => setPayoutMethod('stripe_connect')}
                      className={`border p-4 rounded-xl cursor-pointer flex flex-col justify-between transition-all ${payoutMethod === 'stripe_connect' ? 'border-[var(--primary-end)] bg-blue-50/20' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-sm">Stripe Connect</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Instant transfer to linked account</p>
                    </div>
                    <div 
                      onClick={() => setPayoutMethod('bank_transfer')}
                      className={`border p-4 rounded-xl cursor-pointer flex flex-col justify-between transition-all ${payoutMethod === 'bank_transfer' ? 'border-[var(--primary-end)] bg-blue-50/20' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold text-sm">Bank Account</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Manual transfer (3-5 business days)</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Withdraw ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="10"
                  max={walletStats.availableBalance}
                  disabled={!hasPayoutMethod || walletStats.availableBalance < 10}
                />
                <p className="text-sm text-muted-foreground">
                  Minimum withdrawal: $10 | Maximum: ${walletStats.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {!hasPayoutMethod && (
                <p className="text-sm text-orange-600 font-medium">
                  Please link a Stripe account or update bank details to enable withdrawals.
                </p>
              )}

              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  {payoutMethod === 'stripe_connect' 
                    ? `Funds will be transferred instantly to your connected account (${stripeStatus.accountId}).`
                    : 'Funds will be transferred to your registered bank account within 3-5 business days.'}
                </p>
              </div>

              <Button 
                onClick={handleWithdraw}
                disabled={isProcessing || !withdrawAmount || parseFloat(withdrawAmount) < 10 || !hasPayoutMethod}
                className="w-full flex items-center space-x-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>{isProcessing ? 'Processing...' : payoutMethod === 'stripe_connect' ? 'Instant Transfer via Stripe' : 'Withdraw Funds'}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle>Linked Bank Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              {hasBankDetails && bankDetails ? (
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
                    <span className="text-muted-foreground">BSB / IFSC:</span>
                    <span className="font-medium">{bankDetails.bsbNumber}</span>
                  </div>
                  <div className="pt-3">
                    <Button variant="outline" size="sm" onClick={() => router.push('/bank-details')}>
                      Manage Payout Settings
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm mb-3">No bank account details configured yet.</p>
                  <Button variant="outline" size="sm" onClick={() => router.push('/bank-details')}>
                    Configure Bank Account / Stripe
                  </Button>
                </div>
              )}
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
              {recentWithdrawals.length > 0 ? (
                <div className="space-y-4">
                  {recentWithdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="border border-[var(--primary-start)] rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{withdrawal.id}</p>
                          <p className="text-xs text-blue-600 font-medium">{withdrawal.method}</p>
                          <p className="text-xs text-muted-foreground">{withdrawal.date}</p>
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
              ) : (
                <p className="text-center py-6 text-sm text-muted-foreground">No recent payouts.</p>
              )}
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
                  <p className="font-medium">Stripe Connect Transfer</p>
                  <p className="text-sm text-muted-foreground">Instant (24/7/365)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Standard Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">3-5 business days</p>
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

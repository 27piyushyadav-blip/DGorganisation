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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Building2, History, CheckCircle, CreditCard } from 'lucide-react';
import { apiClient } from '@/client/api/api-client';

export default function BankDetailsPage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingStripe, setCheckingStripe] = useState(true);

  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountName: '',
    bsb: '',
    abn: '',
    bankName: '',
  });

  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    bsb: '',
    abn: '',
    bankName: '',
  });

  const [stripeStatus, setStripeStatus] = useState<{
    onboarded: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    accountId: string | null;
  }>({
    onboarded: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
    accountId: null,
  });

  const fetchBankDetails = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const profile: any = await apiClient(`${API_BASE}/organizations/profile`);
      if (profile) {
        const details = profile.bankDetails || {};
        const stateData = {
          accountNumber: details.accountNumber || '',
          accountName: details.accountName || profile.name || '',
          bsb: details.bsbCode || '',
          abn: details.abn || profile.taxIdNumber || '',
          bankName: details.bankName || '',
        };
        setBankDetails(stateData);
        setFormData(stateData);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeStatus = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const res = await apiClient<any>(`${API_BASE}/organizations/wallet/stripe-connect/status`);
      if (res) {
        setStripeStatus({
          onboarded: res.onboarded,
          payoutsEnabled: res.payoutsEnabled,
          detailsSubmitted: res.detailsSubmitted,
          accountId: res.accountId,
        });
      }
    } catch (e) {
      console.error('Error fetching Stripe status:', e);
    } finally {
      setCheckingStripe(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchBankDetails(), fetchStripeStatus()]);
  }, []);

  const handleEdit = () => {
    setFormData({
      accountNumber: bankDetails.accountNumber,
      accountName: bankDetails.accountName,
      bsb: bankDetails.bsb,
      abn: bankDetails.abn,
      bankName: bankDetails.bankName,
    });
    setShowWarning(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      await apiClient(`${API_BASE}/organizations/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          bankDetails: {
            bankName: formData.bankName,
            accountName: formData.accountName,
            accountNumber: formData.accountNumber,
            bsbCode: formData.bsb,
            abn: formData.abn,
          },
          taxIdNumber: formData.abn,
        }),
      });

      setBankDetails(formData);
      setIsEditModalOpen(false);
      setShowWarning(false);
      alert('Bank details updated successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || 'Failed to update bank details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const res: any = await apiClient(`${API_BASE}/organizations/wallet/stripe-connect/onboard`, {
        method: 'POST',
        body: JSON.stringify({
          returnUrl: window.location.origin + '/bank-details?status=stripe_success',
          refreshUrl: window.location.origin + '/bank-details?status=stripe_refresh',
        }),
      });
      if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start Stripe onboarding.');
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return 'N/A';
    if (accountNumber.length <= 4) return '****';
    return '****' + accountNumber.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--card-bg-light)] min-h-screen">
        <p className="text-muted-foreground animate-pulse text-lg font-medium">Loading Bank Details...</p>
      </div>
    );
  }

  const hasBankDetails = bankDetails.accountNumber !== '';

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Account Details</h1>
          <p className="text-muted-foreground">
            Manage your bank account information for withdrawals
          </p>
        </div>
        <Button onClick={handleEdit}>
          <Building2 className="mr-2 h-4 w-4" />
          Update Bank Details
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Manual Bank Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasBankDetails ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Bank Name</Label>
                    <p className="font-semibold">{bankDetails.bankName || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Account Holder Name</Label>
                    <p className="font-semibold">{bankDetails.accountName || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Account Number</Label>
                    <p className="font-semibold">{maskAccountNumber(bankDetails.accountNumber)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">BSB / IFSC</Label>
                    <p className="font-semibold">{bankDetails.bsb || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">ABN</Label>
                    <p className="font-semibold">{bankDetails.abn || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Verified Account</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Your bank account is verified and ready for withdrawals
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No bank account registered. Click 'Update Bank Details' to configure your account.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stripe Connect Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Stripe Connect (Instant Payouts)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkingStripe ? (
              <p className="text-muted-foreground animate-pulse text-sm">Checking Stripe status...</p>
            ) : stripeStatus.onboarded ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold text-sm">Stripe Account Linked successfully!</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground border-t border-[var(--primary-start)] pt-3">
                  <div>
                    <span className="font-medium text-gray-700 block">Stripe Account ID</span> 
                    <code className="text-xs bg-gray-100 p-1 rounded font-mono">{stripeStatus.accountId}</code>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block">Payouts Enabled</span> 
                    <span className="text-green-600 font-semibold">Active</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block">Verification Status</span> 
                    <span className="text-green-600 font-semibold">Completed</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleConnectStripe}>
                  Update Stripe Account Details
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Link your business Stripe account to receive withdrawals instantly to your connected bank account. 
                  Express onboarding takes less than 2 minutes.
                </p>
                <Button onClick={handleConnectStripe} className="w-full sm:w-auto">
                  Connect Stripe Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-semibold">
            Security & Compliance Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Every change to your bank details is logged and audited for security reasons.
            </p>
            <p>
              • In case of unauthorized access, bank account modification notifies all administrators.
            </p>
            <p>
              • Sensitive database records are encrypted to keep your financial information secure.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Warning Modal */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
              Security Warning
            </DialogTitle>
            <DialogDescription>
              Updating bank details will be recorded for security purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Important Notice</p>
                <p>
                  For your security, all bank detail changes are logged and monitored. 
                  Only proceed if you authorized this change.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowWarning(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowWarning(false);
                setIsEditModalOpen(true);
              }}
            >
              I Understand, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Bank Account Details</DialogTitle>
            <DialogDescription>
              Enter your new bank account information for withdrawals.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Enter bank name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Enter account number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bsb">BSB / IFSC Code</Label>
              <Input
                id="bsb"
                type="text"
                value={formData.bsb}
                onChange={(e) => setFormData({ ...formData, bsb: e.target.value })}
                placeholder="Enter BSB or IFSC code"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abn">ABN (Optional)</Label>
              <Input
                id="abn"
                type="text"
                value={formData.abn}
                onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
                placeholder="Enter ABN (11 digits)"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Verification Notice</p>
                  <p>
                    Bank account changes may require verification before withdrawals can be processed.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Building2, History, CheckCircle } from 'lucide-react';

export default function BankDetailsPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Sample data - in real app this would come from API
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '123456789',
    bsb: '063000',
    abn: '12345678901',
    bankName: 'Commonwealth Bank',
  });

  const [formData, setFormData] = useState({
    accountNumber: bankDetails.accountNumber,
    bsb: bankDetails.bsb,
    abn: bankDetails.abn,
    bankName: bankDetails.bankName,
  });

  const bankHistory = [
    {
      id: 1,
      date: '2024-02-15',
      accountNumber: '****5678',
      bankName: 'Commonwealth Bank',
      changedBy: 'Admin User',
    },
    {
      id: 2,
      date: '2024-01-10',
      accountNumber: '****1234',
      bankName: 'Westpac',
      changedBy: 'Admin User',
    },
    {
      id: 3,
      date: '2023-12-05',
      accountNumber: '****9876',
      bankName: 'ANZ',
      changedBy: 'Admin User',
    },
  ];

  const handleEdit = () => {
    setFormData({
      accountNumber: bankDetails.accountNumber,
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update bank details
      setBankDetails(formData);
      setIsEditModalOpen(false);
      setShowWarning(false);
      
      // Show success message (in real app, you'd use a toast notification)
      alert('Bank details updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to update bank details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return '****';
    return '****' + accountNumber.slice(-4);
  };

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

      {/* Current Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Current Bank Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Bank Name</Label>
              <p className="font-semibold">{bankDetails.bankName}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Account Number</Label>
              <p className="font-semibold">{maskAccountNumber(bankDetails.accountNumber)}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">BSB</Label>
              <p className="font-semibold">{bankDetails.bsb}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">ABN</Label>
              <p className="font-semibold">{bankDetails.abn}</p>
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
        </CardContent>
      </Card>

      {/* Bank History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Bank History (Read Only)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bankHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-500">{record.date}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Account:</span> {record.accountNumber}
                    </div>
                    <div>
                      <span className="font-medium">Bank:</span> {record.bankName}
                    </div>
                    <div>
                      <span className="font-medium">Changed By:</span> {record.changedBy}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              <Label htmlFor="bsb">BSB</Label>
              <Input
                id="bsb"
                type="text"
                value={formData.bsb}
                onChange={(e) => setFormData({ ...formData, bsb: e.target.value })}
                placeholder="Enter BSB (e.g., 063000)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abn">ABN</Label>
              <Input
                id="abn"
                type="text"
                value={formData.abn}
                onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
                placeholder="Enter ABN (11 digits)"
                required
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

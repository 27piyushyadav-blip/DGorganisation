'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Save, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function BankDetails() {
  const [formData, setFormData] = useState({
    accountHolderName: 'Digital Health Organization',
    accountNumber: '123456789',
    abnNumber: '12345678901',
    bsbNumber: '062000',
    bankName: 'Commonwealth Bank',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      alert('Bank details saved successfully!');
    }, 1500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values (in real app, you'd store original values)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bank Details</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Details
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Notice */}
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <p className="text-sm text-green-800">
              Your bank details are encrypted and stored securely. All changes are logged for audit purposes.
            </p>
          </div>

          {/* Bank Details Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Bank Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bsbNumber">BSB Number</Label>
                  <Input
                    id="bsbNumber"
                    value={formData.bsbNumber}
                    onChange={(e) => handleInputChange('bsbNumber', e.target.value)}
                    disabled={!isEditing}
                    placeholder="XXX-XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abnNumber">ABN Number (Australian Business Number)</Label>
                  <Input
                    id="abnNumber"
                    value={formData.abnNumber}
                    onChange={(e) => handleInputChange('abnNumber', e.target.value)}
                    disabled={!isEditing}
                    placeholder="XX XXX XXX XXX"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Details'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Account Verification</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">ABN Verification</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Last Updated</span>
                  <span className="text-muted-foreground">February 15, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Audit Logging</p>
                    <p className="text-xs text-muted-foreground">
                      All changes to bank details are logged with timestamp and IP address for security.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Processing Time</p>
                    <p className="text-xs text-muted-foreground">
                      Withdrawals to verified accounts take 3-5 business days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Security</p>
                    <p className="text-xs text-muted-foreground">
                      Your information is encrypted and protected with industry-standard security.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                View Bank History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Download Verification
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                If you're having trouble updating your bank details, our support team is here to help.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

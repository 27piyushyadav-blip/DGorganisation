'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, History, Eye, EyeOff, Calendar, User, Activity } from 'lucide-react';

export default function BankHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const bankHistory = [
    {
      id: 1,
      date: '2024-02-15',
      time: '14:30:22',
      action: 'Updated',
      accountNumber: '123456789',
      abnNumber: '12345678901',
      bsbNumber: '062000',
      changedBy: 'Admin User',
      ipAddress: '192.168.1.100',
      oldValue: {
        accountNumber: '987654321',
        bsbNumber: '062001'
      },
      newValue: {
        accountNumber: '123456789',
        bsbNumber: '062000'
      }
    },
    {
      id: 2,
      date: '2024-02-10',
      time: '09:15:45',
      action: 'Added',
      accountNumber: '987654321',
      abnNumber: '12345678901',
      bsbNumber: '062001',
      changedBy: 'Admin User',
      ipAddress: '192.168.1.100',
      oldValue: null,
      newValue: {
        accountNumber: '987654321',
        abnNumber: '12345678901',
        bsbNumber: '062001',
        bankName: 'Commonwealth Bank'
      }
    },
    {
      id: 3,
      date: '2024-01-28',
      time: '16:45:12',
      action: 'Updated',
      accountNumber: '987654321',
      abnNumber: '12345678901',
      bsbNumber: '062001',
      changedBy: 'System Admin',
      ipAddress: '10.0.0.50',
      oldValue: {
        abnNumber: '98765432109'
      },
      newValue: {
        abnNumber: '12345678901'
      }
    },
    {
      id: 4,
      date: '2024-01-15',
      time: '11:20:33',
      action: 'Added',
      accountNumber: '555666777',
      abnNumber: '98765432109',
      bsbNumber: '013000',
      changedBy: 'Admin User',
      ipAddress: '192.168.1.100',
      oldValue: null,
      newValue: {
        accountNumber: '555666777',
        abnNumber: '98765432109',
        bsbNumber: '013000',
        bankName: 'Westpac'
      }
    },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Added':
        return 'bg-green-100 text-green-800';
      case 'Updated':
        return 'bg-blue-100 text-blue-800';
      case 'Deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (showSensitiveData) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  const maskABNNumber = (abnNumber: string) => {
    if (showSensitiveData) return abnNumber;
    return `****-${abnNumber.slice(-5)}`;
  };

  const maskBSBNumber = (bsbNumber: string) => {
    if (showSensitiveData) return bsbNumber;
    return `***-${bsbNumber.slice(-3)}`;
  };

  const filteredHistory = bankHistory.filter(entry => 
    entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.changedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bank Details History</h1>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center space-x-2"
          >
            {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showSensitiveData ? 'Hide' : 'Show'} Sensitive Data</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, user, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Audit Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--primary-start)]">
                  <th className="text-left p-3">Date & Time</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Account No</th>
                  <th className="text-left p-3">ABN</th>
                  <th className="text-left p-3">BSB</th>
                  <th className="text-left p-3">Changed By</th>
                  <th className="text-left p-3">IP Address</th>
                  <th className="text-left p-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--primary-start)] hover:bg-[var(--card-bg-light)]">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{entry.date}</div>
                        <div className="text-sm text-muted-foreground">{entry.time}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono">{maskAccountNumber(entry.accountNumber)}</td>
                    <td className="p-3 font-mono">{maskABNNumber(entry.abnNumber)}</td>
                    <td className="p-3 font-mono">{maskBSBNumber(entry.bsbNumber)}</td>
                    <td className="p-3">{entry.changedBy}</td>
                    <td className="p-3 font-mono text-sm">{entry.ipAddress}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">
                        View Changes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No history entries found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankHistory.length}</div>
            <p className="text-xs text-muted-foreground">All time changes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updates</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bankHistory.filter(e => e.action === 'Updated').length}
            </div>
            <p className="text-xs text-muted-foreground">Bank details updated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Entries</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bankHistory.filter(e => e.action === 'Added').length}
            </div>
            <p className="text-xs text-muted-foreground">Bank details added</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Change</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankHistory[0]?.date || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Most recent update</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">All changes are logged</p>
                <p className="text-sm text-muted-foreground">
                  Every modification to bank details is recorded with timestamp, user information, and IP address.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Audit trail maintained</p>
                <p className="text-sm text-muted-foreground">
                  Complete history is maintained for compliance and dispute resolution purposes.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Data protection</p>
                <p className="text-sm text-muted-foreground">
                  Sensitive information is masked by default and encrypted in storage.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

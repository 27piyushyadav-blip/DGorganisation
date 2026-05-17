import type { Metadata } from 'next';

import DashboardLayout from '@/components/DashboardLayout';
import { AuthProvider } from '@/contexts/auth-context';

import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Organization Panel - DigitalOffices',
  description: 'Manage your organization, experts, and bookings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}

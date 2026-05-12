import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import DashboardLayout from '@/components/DashboardLayout';
import { AuthProvider } from '@/contexts/auth-context';

import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <AuthProvider>
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}

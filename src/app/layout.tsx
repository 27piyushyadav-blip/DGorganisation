import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import DashboardLayout from '@/components/DashboardLayout';

import './globals.css';

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
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}

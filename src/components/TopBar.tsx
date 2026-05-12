'use client';

import Link from 'next/link';
import { Bell, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/UserNav';

export default function TopBar() {
  let notificationCount = "5"; 
  return (
    <div className="bg-[var(--card-bg)] border-border border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-[var(--primary-start)] to-[var(--primary-end)] flex h-10 w-10 items-center justify-center rounded-lg">
              <Building className="text-primary-foreground h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">DigitalOffices</h1>
              <p className="text-muted-foreground text-xs">
                Organization Panel
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/notifications">
            <button  className="relative">
              <Bell className="h-6 w-6 mt-2" />
              
              <span className={`absolute -top-1 ${notificationCount.length === 2 ? '-right-2' :notificationCount.length > 2 ? '-right-3' : '-right-1'} flex min-w-[18px] h-[20px] items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-[10px] font-medium text-white px-1`}>
                {notificationCount.length > 2 && notificationCount.length <= 3 ? '99+' : notificationCount}
              </span>
            </button>
          </Link>
          
          <UserNav />
        </div>
      </div>
    </div>
  );
}

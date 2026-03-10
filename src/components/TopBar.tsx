'use client';

import Link from 'next/link';
import { Bell, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/UserNav';

export default function TopBar() {
  return (
    <div className="bg-background border-border border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                4
              </span>
            </Button>
          </Link>
          
          <UserNav />
        </div>
      </div>
    </div>
  );
}

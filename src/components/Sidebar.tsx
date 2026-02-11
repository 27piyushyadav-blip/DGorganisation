'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Bell,
  Building,
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Video,
  X,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
    },
    {
      title: 'Expert Management',
      href: '/experts',
      icon: Users,
      description: 'Manage experts and requests',
    },
    {
      title: 'Bookings',
      href: '/bookings',
      icon: Calendar,
      description: 'View and manage bookings',
    },
    {
      title: 'Sessions',
      href: '/sessions',
      icon: Video,
      description: 'Active and scheduled sessions',
    },
    {
      title: 'Notifications',
      href: '/notifications',
      icon: Bell,
      description: 'View all notifications',
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: Settings,
      description: 'Organization settings',
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-card border-border fixed inset-y-0 left-0 z-40 w-64 transform border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-border border-b p-6">
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

          {/* User info */}
          <div className="border-border border-b p-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src="/avatars/organization.jpg"
                  alt="Organization"
                />
                <AvatarFallback>DO</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Digital Health Org</p>
                <p className="text-muted-foreground text-xs">
                  contact@digitalhealth.com
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => {
              const isActive = currentPage === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-border border-t p-4">
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

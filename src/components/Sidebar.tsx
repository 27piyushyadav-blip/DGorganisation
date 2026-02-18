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
  TrendingUp,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Experts',
      href: '/experts',
      icon: Users,
    },
    {
      title: 'Expert Requests',
      href: '/expert-requests',
      icon: Users,
    },
    {
      title: 'Services',
      href: '/services',
      icon: Calendar,
    },
    {
      title: 'Bookings',
      href: '/bookings',
      icon: Video,
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: TrendingUp,
    },
    {
      title: 'Messages',
      href: '/messages',
      icon: Bell,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: Settings,
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
        className={`bg-card border-border fixed inset-y-0 left-0 z-40 transform border-r transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-64'} `}
      >
        <div className="flex h-full flex-col">
          {/* User info */}
          <div className={`border-border border-b ${isCollapsed ? 'p-3' : 'p-6'}`}>
            <div className="flex items-center justify-center">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src="/avatars/organization.jpg"
                  alt="Organization"
                />
                <AvatarFallback>DO</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Digital Health Org</p>
                  <p className="text-muted-foreground text-xs">
                    contact@digitalhealth.com
                  </p>
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex"
              >
                <Menu className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {menuItems.map((item) => {
              const isActive = currentPage === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} rounded-lg px-3 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } `}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`border-border border-t ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <Button 
              variant="ghost" 
              className={`${isCollapsed ? 'w-full justify-center' : 'w-full justify-start'}`}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`} />
              {!isCollapsed && 'Logout'}
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

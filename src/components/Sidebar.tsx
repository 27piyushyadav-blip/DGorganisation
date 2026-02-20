'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Bell,
  Building,
  Calendar,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  Users,
  Video,
  X,
  Wallet,
  CreditCard,
  ArrowUpDown,
  Building2,
  History,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
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
  const [isCommunicationExpanded, setIsCommunicationExpanded] = useState(false);
  const [isWalletExpanded, setIsWalletExpanded] = useState(false);
  const [isBookingsExpanded, setIsBookingsExpanded] = useState(false);
  const [isRefundExpanded, setIsRefundExpanded] = useState(false);
  const [isBankExpanded, setIsBankExpanded] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Communication',
      href: '/communication',
      icon: Bell,
      hasSubmenu: true,
      submenu: [
        {
          title: 'Messages',
          href: '/messages',
          icon: Bell,
        },
        {
          title: 'Services',
          href: '/services',
          icon: Calendar,
        },
      ],
    },
    {
      title: 'Bookings',
      href: '/bookings',
      icon: Video,
      hasSubmenu: true,
      submenu: [
        {
          title: 'Overview',
          href: '/bookings',
          icon: LayoutDashboard,
        },
        {
          title: 'Requests',
          href: '/bookings/requests',
          icon: AlertCircle,
        },
        {
          title: 'Confirmed',
          href: '/bookings/confirmed',
          icon: CheckCircle,
        },
        {
          title: 'Ongoing',
          href: '/bookings/ongoing',
          icon: Clock,
        },
        {
          title: 'Completed',
          href: '/bookings/completed',
          icon: CheckCircle,
        },
        {
          title: 'Cancelled',
          href: '/bookings/cancelled',
          icon: XCircle,
        },
        {
          title: 'Disputes',
          href: '/bookings/disputes',
          icon: XCircle,
        },
      ],
    },
    {
      title: 'Experts',
      href: '/experts',
      icon: Users,
    },
    {
      title: 'Refund',
      href: '/refunds',
      icon: CreditCard,
      hasSubmenu: true,
      submenu: [
        {
          title: 'Refund Dashboard',
          href: '/refunds',
          icon: CreditCard,
        },
        {
          title: 'Refund Logs',
          href: '/wallet/refund-logs',
          icon: History,
        },
      ],
    },
    {
      title: 'Expert Requests',
      href: '/expert-requests',
      icon: Users,
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: TrendingUp,
    },
    {
      title: 'Bank',
      href: '/bank',
      icon: Building2,
      hasSubmenu: true,
      submenu: [
        {
          title: 'Wallet',
          href: '/wallet',
          icon: Wallet,
        },
        {
          title: 'Balance Overview',
          href: '/wallet/balance',
          icon: DollarSign,
        },
        {
          title: 'Transactions',
          href: '/wallet/transactions',
          icon: CreditCard,
        },
        {
          title: 'Withdraw',
          href: '/wallet/withdraw',
          icon: ArrowUpDown,
        },
        {
          title: 'Bank Details',
          href: '/bank-details',
          icon: Building2,
        },
        {
          title: 'Bank History',
          href: '/wallet/bank-history',
          icon: History,
        },
      ],
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
              if (item.hasSubmenu) {
                const isActive = 
                  (item.title === 'Communication' && (currentPage === '/messages' || currentPage === '/services')) ||
                  (item.title === 'Bookings' && currentPage.startsWith('/bookings')) ||
                  (item.title === 'Refund' && (currentPage === '/refunds' || currentPage.startsWith('/refunds/') || currentPage === '/wallet/refund-logs')) ||
                  (item.title === 'Bank' && (currentPage === '/bank' || currentPage === '/wallet' || currentPage === '/bank-details' || currentPage.startsWith('/wallet/') && currentPage !== '/wallet/refund-logs'));
                return (
                  <div key={item.title}>
                    <button
                      className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} rounded-lg px-3 py-3 text-sm transition-colors w-full ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      } `}
                      onClick={() => {
                        if (item.title === 'Communication') {
                          setIsCommunicationExpanded(!isCommunicationExpanded);
                        } else if (item.title === 'Wallet') {
                          setIsWalletExpanded(!isWalletExpanded);
                        } else if (item.title === 'Bookings') {
                          setIsBookingsExpanded(!isBookingsExpanded);
                        } else if (item.title === 'Refund') {
                          setIsRefundExpanded(!isRefundExpanded);
                        } else if (item.title === 'Bank') {
                          setIsBankExpanded(!isBankExpanded);
                        }
                      }}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium">{item.title}</span>
                          {item.title === 'Communication' ? (
                            isCommunicationExpanded ? (
                              <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            )
                          ) : item.title === 'Wallet' ? (
                            isWalletExpanded ? (
                              <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            )
                          ) : item.title === 'Bookings' ? (
                            isBookingsExpanded ? (
                              <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            )
                          ) : item.title === 'Refund' ? (
                            isRefundExpanded ? (
                              <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            )
                          ) : item.title === 'Bank' ? (
                            isBankExpanded ? (
                              <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            )
                          ) : null}
                        </>
                      )}
                    </button>
                    
                    {!isCollapsed && 
                      ((item.title === 'Communication' && isCommunicationExpanded) || 
                       (item.title === 'Wallet' && isWalletExpanded) ||
                       (item.title === 'Bookings' && isBookingsExpanded) ||
                       (item.title === 'Refund' && isRefundExpanded) ||
                       (item.title === 'Bank' && isBankExpanded)) && 
                      item.submenu && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = currentPage === subItem.href;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isSubActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              } `}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <subItem.icon className="h-4 w-4" />
                              <span className="font-medium">{subItem.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
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
              }
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

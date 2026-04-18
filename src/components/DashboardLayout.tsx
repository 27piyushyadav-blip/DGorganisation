"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isVerified = user?.verificationStatus === 'VERIFIED';

  // Check if current page is an authentication page
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/check-email' || pathname === '/verify' || pathname.startsWith('/auth/');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isAuthPage) {
        router.push('/login');
      } else if (isAuthenticated && isAuthPage) {
        router.push('/');
      } else if (isAuthenticated && !isVerified && pathname !== '/profile' && !isAuthPage) {
        console.log("Redirecting unverified user to profile", { pathname, isVerified });
        router.push('/profile');
      }
    }
  }, [isLoading, isAuthenticated, isVerified, pathname, isAuthPage, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prevent flash of protected content or auth pages while redirecting
  if (!isAuthenticated && !isAuthPage) return null;
  if (isAuthenticated && isAuthPage) return null;
  
  // Strict check: if authenticated but not verified, only allow /profile
  if (isAuthenticated && !isVerified && pathname !== '/profile' && !isAuthPage) {
    return null;
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={pathname} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

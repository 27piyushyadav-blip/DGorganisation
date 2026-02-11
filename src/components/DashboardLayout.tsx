"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={pathname} />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

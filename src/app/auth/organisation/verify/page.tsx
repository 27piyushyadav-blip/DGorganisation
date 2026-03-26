"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// 1. Extract the hook and redirect logic into a separate component
function VerifyRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    
    // Redirect to the correct frontend route with the same token
    if (token) {
      router.replace(`/verify?token=${token}`);
    } else {
      // No token, redirect to login
      router.replace("/login");
    }
  }, [searchParams, router]);

  return null; // This component handles logic but doesn't render its own UI
}

// 2. Wrap the extracted component in a Suspense boundary
export default function AuthOrganisationVerifyPage() {
  return (
    <div className="flex min-h-dvh w-full bg-white items-center justify-center">
      <div className="text-center">
        {/* The loading UI stays outside so it renders immediately */}
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-zinc-600">Redirecting to verification page...</p>
        
        {/* Suspense boundary for useSearchParams */}
        <Suspense fallback={null}>
          <VerifyRedirector />
        </Suspense>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function VerifyRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    
    if (token) {
      router.replace(`/verify?token=${token}`);
    } else {
      router.replace("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p className="text-zinc-600">Redirecting to verification page...</p>
    </div>
  );
}

export default function AuthOrganisationVerifyPage() {
  return (
    <div className="flex min-h-dvh w-full bg-white items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-zinc-600">Loading...</p>
        </div>
      }>
        <VerifyRedirect />
      </Suspense>
    </div>
  );
}

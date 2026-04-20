"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing authentication...");

  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get("at");
        const refreshToken = searchParams.get("rt");

        if (!accessToken || !refreshToken) {
          setStatus("Authentication failed: Missing tokens");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        // Update auth context state
        await refreshUser();

        setStatus("Authentication successful! Redirecting...");
        
        // Redirect to dashboard after successful authentication
        router.push("/");
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("Authentication failed. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-zinc-900 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          {status}
        </h2>
        <p className="text-zinc-600">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-zinc-900 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Loading...
            </h2>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

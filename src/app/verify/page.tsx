"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Building } from "lucide-react";
import { toast } from "sonner";
import { verifyEmailApi, AuthError } from "@/client/api/auth";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams?.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await verifyEmailApi(token);
        setStatus("success");
        setMessage(result.message);
        toast.success("Email verified successfully!", {
          description: "You can now login to your organization account.",
        });
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (error) {
        if (error instanceof AuthError) {
          // Check if it's a "already verified" or token used error
          if (error.message.includes("already verified") || error.statusCode === 400) {
            setStatus("success");
            setMessage("Your email is already verified! You can now login.");
            toast.success("Email verified!", {
              description: "Your organization account is ready to use.",
            });
            // Redirect to login page after 2 seconds
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          } else {
            setStatus("error");
            setMessage(error.message);
            toast.error("Verification failed", {
              description: error.message,
            });
          }
        } else {
          setStatus("error");
          setMessage("An unexpected error occurred");
          toast.error("Verification failed", {
            description: "Please try again or contact support",
          });
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-dvh w-full bg-white">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1614064641938-3bcee529cfc4?q=80&w=2669&auto=format&fit=crop')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/50 to-zinc-950/30"></div>

        <div className="relative z-10 p-16 text-white max-w-xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-300 backdrop-blur-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
            Email Verification
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Securing your <br /> organization account.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Verifying your email ensures that your organization profile and communications remain secure and authentic.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 py-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`flex items-center justify-center h-16 w-16 rounded-full shadow-lg mb-4 ${
              status === "loading" 
                ? "bg-blue-100 text-blue-600" 
                : status === "success" 
                ? "bg-green-100 text-green-600" 
                : "bg-red-100 text-red-600"
            }`}>
              {status === "loading" && <Loader2 className="h-8 w-8 animate-spin" />}
              {status === "success" && <CheckCircle className="h-8 w-8" />}
              {status === "error" && <XCircle className="h-8 w-8" />}
            </div>
            
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 text-white shadow-lg">
              <Building className="h-6 w-6" />
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </h1>
            
            <p className="text-sm text-zinc-500 max-w-xs">
              {status === "loading" && "Please wait while we verify your email address."}
              {status === "success" && message}
              {status === "error" && message}
            </p>
          </div>

          {status === "error" && (
            <div className="text-center space-y-4">
              <button
                onClick={() => router.push("/login")}
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-lg transition-all duration-200 rounded-lg"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="w-full h-11 bg-white hover:bg-zinc-50 text-zinc-900 font-medium border border-zinc-200 transition-all duration-200 rounded-lg"
              >
                Create New Account
              </button>
            </div>
          )}

          {status === "success" && (
            <div className="text-center text-sm text-zinc-500">
              Redirecting to login page in a moment...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

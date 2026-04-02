"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, Building } from "lucide-react";
import Link from "next/link";

function EmailContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : "your email";

  return (
    <p className="text-sm text-zinc-500 max-w-xs">
      We've sent a verification link to{" "}
      <span className="font-medium text-zinc-900">{maskedEmail}</span>
    </p>
  );
}

export default function CheckEmailPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
  };

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
            Check Your Inbox
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Almost there! <br/> Verify your email.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            We've sent a verification link to your email address. Click the link to activate your organization account and start managing your team.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 py-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 shadow-lg mb-4">
              <Mail className="h-8 w-8" />
            </div>
            
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 text-white shadow-lg">
              <Building className="h-6 w-6" />
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Check your email
            </h1>
            
            <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
              <EmailContent />
            </Suspense>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">What's next?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your inbox for verification email</li>
                    <li>Click verification link in the email</li>
                    <li>Return here to login to your organization account</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <Link
              href="/login"
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-lg transition-all duration-200 rounded-lg inline-flex items-center justify-center"
            >
              Go to Login <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <div className="text-sm text-zinc-500">
              Didn't receive the email?{" "}
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className={`font-medium text-zinc-900 hover:underline transition-colors ${
                  countdown > 0 && "opacity-50 cursor-not-allowed no-underline"
                }`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend email"}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              ← Back to registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

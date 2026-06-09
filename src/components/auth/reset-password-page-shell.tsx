import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import ResetPasswordForm from "@/components/auth/reset-password-form";

type ResetPasswordPageShellProps = {
  token?: string | null;
};

export default function ResetPasswordPageShell({ token }: ResetPasswordPageShellProps) {
  return (
    <div className="flex min-h-dvh w-full bg-white">
      <div className="hidden lg:flex w-1/2 bg-zinc-950 items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=2670&auto=format&fit=crop')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/50 to-zinc-950/30"></div>

        <div className="relative z-10 p-16 text-white max-w-xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-300 backdrop-blur-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
            Password Recovery
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Create your <br /> new password.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Choose a strong password to protect your organization account and restore secure access to your dashboard.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 py-12 lg:p-16">
        <Suspense
          fallback={
            <div className="flex items-center gap-2 text-zinc-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading password reset...
            </div>
          }
        >
          <ResetPasswordForm token={token} />
        </Suspense>
      </div>
    </div>
  );
}

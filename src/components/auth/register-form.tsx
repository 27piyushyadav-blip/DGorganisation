"use client";

import { Eye, EyeOff, Loader2, User, Mail, Lock, ArrowRight, Building } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useRegisterForm } from "./useRegisterForm";

export default function RegisterForm() {
  const {
    form,
    onSubmit,
    handleGoogleSignUp,
    isLoading,
    loadingType,
    showPassword,
    setShowPassword,
  } = useRegisterForm();

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-2">
          <Building />
        </div>
        <h1 className="text-2xl font-bold">Join Organization Portal</h1>
        <p className="text-sm text-zinc-500">Create your organization account</p>
      </div>

      <GoogleButton
        onClick={handleGoogleSignUp}
        isLoading={loadingType === "google"}
        disabled={isLoading}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-500">Or register with email</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      {...field} 
                      placeholder="Your Organization" 
                      disabled={isLoading}
                      className="pl-9 h-11 bg-zinc-50/30 border-zinc-200 focus-visible:ring-zinc-900 transition-all disabled:opacity-50"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      {...field} 
                      placeholder="name@example.com" 
                      disabled={isLoading}
                      className="pl-9 h-11 bg-zinc-50/30 border-zinc-200 focus-visible:ring-zinc-900 transition-all disabled:opacity-50"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="pl-9 pr-10 h-11 bg-zinc-50/30 border-zinc-200 focus-visible:ring-zinc-900 transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-lg shadow-zinc-900/10 transition-all duration-200" 
            disabled={isLoading}
          >
            {loadingType === "credentials" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className={cn("font-semibold text-zinc-900 hover:text-zinc-700 transition-colors", isLoading && "pointer-events-none opacity-50")}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

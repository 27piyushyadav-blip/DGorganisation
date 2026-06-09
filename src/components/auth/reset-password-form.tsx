"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ControllerRenderProps } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Building, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthError, resetPasswordApi } from "@/client/api/auth";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const formSchema = z
  .object({
    password: z.string().regex(passwordRegex, {
      message:
        "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof formSchema>;

type ResetPasswordFormProps = {
  token?: string | null;
};

type PasswordFieldProps = {
  field: ControllerRenderProps<ResetPasswordValues, "password">;
};

type ConfirmPasswordFieldProps = {
  field: ControllerRenderProps<ResetPasswordValues, "confirmPassword">;
};

export default function ResetPasswordForm({ token: tokenProp }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = tokenProp || searchParams?.get("token");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      toast.error("Missing reset token.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordApi(token, values.password);
      toast.success("Password reset successful", {
        description: "You can now login with your new password.",
      });
      router.push("/login");
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error("Reset failed", {
          description: error.message,
        });
      } else {
        toast.error("Something went wrong", {
          description: "Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Invalid reset link
        </h1>
        <p className="text-sm text-zinc-500">
          Please request a new password reset link from the forgot password page.
        </p>
        <Button
          type="button"
          className="h-11 bg-zinc-900 text-white hover:bg-zinc-800"
          onClick={() => router.push("/forgot-password")}
        >
          Request New Link
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg mb-2">
          <Building className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Set new password
        </h1>
        <p className="text-sm text-zinc-500">
          Choose a strong password for your organization account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }: PasswordFieldProps) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="h-11 pl-9 bg-zinc-50/30 border-zinc-200 focus-visible:ring-zinc-900"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }: ConfirmPasswordFieldProps) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="h-11 pl-9 bg-zinc-50/30 border-zinc-200 focus-visible:ring-zinc-900"
                      disabled={isLoading}
                      {...field}
                    />
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
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Reset Password <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

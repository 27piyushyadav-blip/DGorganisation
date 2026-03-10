"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, RegisterInput } from "@/schemas/authSchemas";
import { registerUserApi, googleRegisterApi, AuthError } from "@/client/api/auth";

export function useRegisterForm() {
  const router = useRouter();
  const [loadingType, setLoadingType] =
    useState<"credentials" | "google" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function handleGoogleSignUp() {
    setLoadingType("google");

    try {
      await googleRegisterApi();
      toast.success("Signed up with Google");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Google Sign-Up failed");
      setLoadingType(null);
    }
  }

  async function onSubmit(values: RegisterInput) {
    setLoadingType("credentials");

    try {
      await registerUserApi(values);
      toast.success("Account created!", { 
        description: "Check your email to verify your account" 
      });
      router.push(`/check-email?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      if (err instanceof AuthError) {
        if (err.statusCode === 409) {
          toast.error("Email already registered as organization");
        } else {
          toast.error(err.message || "Registration failed");
        }
      } else {
        toast.error(err.message || "Something went wrong");
      }
      setLoadingType(null);
    }
  }

  return {
    form,
    onSubmit,
    handleGoogleSignUp,
    loadingType,
    isLoading: !!loadingType,
    showPassword,
    setShowPassword,
  };
}

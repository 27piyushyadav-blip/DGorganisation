import ResetPasswordPageShell from "@/components/auth/reset-password-page-shell";

export const metadata = {
  title: "Reset Password | Organization Portal",
  description: "Create a new password for your organization account.",
};

type ResetPasswordVerifyPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordVerifyPage({
  searchParams,
}: ResetPasswordVerifyPageProps) {
  const params = await searchParams;

  return <ResetPasswordPageShell token={params?.token} />;
}

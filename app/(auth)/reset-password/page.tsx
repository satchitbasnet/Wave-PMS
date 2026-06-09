import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset password | Wave",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const isUpdate = searchParams.type === "update";

  return (
    <AuthCard
      title={isUpdate ? "Set new password" : "Reset your password"}
      description={
        isUpdate
          ? "Enter your new password below"
          : "We'll send you a link to reset your password"
      }
      footer={
        <Link href="/login" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
          Back to sign in
        </Link>
      }
    >
      <ResetPasswordForm mode={isUpdate ? "update" : "request"} />
    </AuthCard>
  );
}

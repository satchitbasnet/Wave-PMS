import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create account | PropFlow",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start managing your properties in minutes"
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}

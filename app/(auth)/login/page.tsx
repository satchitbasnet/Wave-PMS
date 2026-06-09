import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in | Wave",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your Wave account"
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
            Create one
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}

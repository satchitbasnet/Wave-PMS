import Link from "next/link";
import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
        <Building2 className="h-6 w-6 text-slate-700" />
        PropFlow
      </Link>
      <Card className="w-full max-w-md border-slate-200 shadow-lg dark:border-slate-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        {footer && (
          <div className="border-t border-slate-100 px-6 py-4 text-center text-sm text-muted-foreground dark:border-slate-800">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}

import { ConnectOnboarding } from "@/components/connect/connect-onboarding";

export const metadata = {
  title: "Stripe Connect | Wave",
};

export default function ConnectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Stripe Connect sample — onboard, sell products, and accept payments
        </p>
      </div>
      <ConnectOnboarding />
    </div>
  );
}

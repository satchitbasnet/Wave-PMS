import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export const metadata = {
  title: "Onboarding | Wave",
};

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-lg py-8">
      <AuthCard
        title="Set up your organization"
        description="Tell us about your property management business"
      >
        <OnboardingForm />
      </AuthCard>
    </div>
  );
}

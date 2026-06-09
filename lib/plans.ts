export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo landlords managing up to 10 units",
    price: 29,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: [
      "Up to 10 units",
      "Tenant portal",
      "Rent tracking",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing portfolios up to 50 units",
    price: 79,
    priceId: process.env.STRIPE_PRICE_GROWTH,
    popular: true,
    features: [
      "Up to 50 units",
      "Maintenance requests",
      "Document storage",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For property management companies",
    price: 199,
    priceId: process.env.STRIPE_PRICE_PRO,
    features: [
      "Unlimited units",
      "Multi-user teams",
      "Advanced reporting",
      "API access",
      "Dedicated support",
    ],
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

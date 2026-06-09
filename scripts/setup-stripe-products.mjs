/**
 * Creates PropFlow subscription products + monthly prices in Stripe.
 * @see https://docs.stripe.com/api/products/object
 * @see https://docs.stripe.com/api/prices
 *
 * Usage: node scripts/setup-stripe-products.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return env;
}

function setEnv(key, value) {
  let content = readFileSync(envPath, "utf8");
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    content = content.replace(pattern, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  writeFileSync(envPath, content);
}

const PLANS = [
  {
    envKey: "STRIPE_PRICE_STARTER",
    id: "starter",
    name: "PropFlow Starter",
    description: "For solo landlords managing up to 10 units",
    amount: 2900,
    features: ["Up to 10 units", "Tenant portal", "Rent tracking", "Email support"],
  },
  {
    envKey: "STRIPE_PRICE_GROWTH",
    id: "growth",
    name: "PropFlow Growth",
    description: "For growing portfolios up to 50 units",
    amount: 7900,
    features: [
      "Up to 50 units",
      "Maintenance requests",
      "Document storage",
      "Priority support",
    ],
  },
  {
    envKey: "STRIPE_PRICE_PRO",
    id: "pro",
    name: "PropFlow Pro",
    description: "For property management companies",
    amount: 19900,
    features: [
      "Unlimited units",
      "Multi-user teams",
      "Advanced reporting",
      "API access",
      "Dedicated support",
    ],
  },
];

const env = loadEnv();
const secretKey = env.STRIPE_SECRET_KEY?.trim();

if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY in .env.local");
  process.exit(1);
}

const stripe = new Stripe(secretKey, {
  apiVersion: "2026-05-27.dahlia",
});

async function findExistingProduct(planId) {
  const products = await stripe.products.search({
    query: `metadata['plan_id']:'${planId}'`,
    limit: 1,
  });
  return products.data[0] ?? null;
}

async function main() {
  console.log("Creating PropFlow Stripe products...\n");

  for (const plan of PLANS) {
    let product = await findExistingProduct(plan.id);

    if (product) {
      console.log(`✓ Product exists: ${product.name} (${product.id})`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { plan_id: plan.id, app: "propflow" },
        marketing_features: plan.features.map((name) => ({ name })),
        default_price_data: {
          currency: "usd",
          unit_amount: plan.amount,
          recurring: { interval: "month" },
        },
      });
      console.log(`+ Created product: ${product.name} (${product.id})`);
    }

    const priceId =
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id;

    if (!priceId) {
      const price = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: plan.amount,
        recurring: { interval: "month" },
      });
      await stripe.products.update(product.id, { default_price: price.id });
      setEnv(plan.envKey, price.id);
      console.log(`  Price: ${price.id} ($${plan.amount / 100}/mo)\n`);
    } else {
      setEnv(plan.envKey, priceId);
      console.log(`  Price: ${priceId} ($${plan.amount / 100}/mo)\n`);
    }
  }

  console.log("Updated .env.local with STRIPE_PRICE_* values.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

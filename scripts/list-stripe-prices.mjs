/**
 * List PropFlow subscription prices from Stripe.
 * @see https://docs.stripe.com/api/prices
 *
 * Usage: node scripts/list-stripe-prices.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

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

const env = loadEnv();
const stripe = new Stripe(env.STRIPE_SECRET_KEY.trim(), {
  apiVersion: "2026-05-27.dahlia",
});

const prices = await stripe.prices.list({
  active: true,
  type: "recurring",
  expand: ["data.product"],
  limit: 20,
});

const propflow = prices.data.filter((p) => {
  const product = p.product;
  return (
    typeof product === "object" &&
    product !== null &&
    !("deleted" in product && product.deleted) &&
    product.metadata?.app === "propflow"
  );
});

console.log("PropFlow recurring prices:\n");
for (const price of propflow) {
  const product = price.product;
  const name = typeof product === "object" && product && "name" in product ? product.name : "?";
  const interval = price.recurring?.interval ?? "one_time";
  console.log(
    `  ${price.id}  $${(price.unit_amount ?? 0) / 100}/${interval}  ${name}  active=${price.active}`
  );
}

console.log(`\n${propflow.length} price(s) found.`);

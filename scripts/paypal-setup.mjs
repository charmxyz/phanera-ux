// One-time: creates the "Phanera Startup" product and a £25/month plan in PayPal,
// then prints the PAYPAL_PLAN_ID to add to your environment.
//   node --env-file=.env.local scripts/paypal-setup.mjs
// Uses PAYPAL_ENV=live for real payments; otherwise the sandbox.
const { PAYPAL_CLIENT_ID: id, PAYPAL_CLIENT_SECRET: secret, PAYPAL_ENV } = process.env;
if (!id || !secret) {
  console.error("Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET first.");
  process.exit(1);
}
const base = PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
  method: "POST",
  headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
  body: "grant_type=client_credentials",
});
if (!tokenRes.ok) throw new Error(`PayPal auth failed: ${tokenRes.status} ${await tokenRes.text()}`);
const { access_token } = await tokenRes.json();

async function post(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

const product = await post("/v1/catalogs/products", { name: "Phanera Startup", description: "AI persona website testing", type: "SERVICE", category: "SOFTWARE" });
const plan = await post("/v1/billing/plans", {
  product_id: product.id,
  name: "Phanera Startup (monthly)",
  status: "ACTIVE",
  billing_cycles: [{
    frequency: { interval_unit: "MONTH", interval_count: 1 },
    tenure_type: "REGULAR",
    sequence: 1,
    total_cycles: 0,
    pricing_scheme: { fixed_price: { value: "25.00", currency_code: "GBP" } },
  }],
  payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 3 },
});

console.log(`\n${PAYPAL_ENV === "live" ? "LIVE" : "Sandbox"} plan created.\n\nPAYPAL_PLAN_ID=${plan.id}\n`);

// Seed the Profintal Savings Supabase project.
//
//   node scripts/seed.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env/.env.local.
//
// This seeds ONLY the platform itself: the admin account with its funded
// treasury, plus the reference data the app needs to work (FX rates, fee
// schedule, gateway list, fraud-detection rules).
//
// It deliberately creates NO customers, transactions, KYC applications,
// transfers, risk flags or alerts — those tables fill up from real signups and
// real activity, so the admin console reads zero until someone actually
// registers. Re-running is safe: it clears the same tables first.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import ws from "ws";

// Node 20 has no global WebSocket; supabase-js needs one to construct a client.
if (typeof globalThis.WebSocket === "undefined") globalThis.WebSocket = ws;

// --- tiny .env loader (no dependency) ---------------------------------------
for (const file of [".env", ".env.local"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
  );
  process.exit(1);
}

const db = createClient(URL, KEY, { auth: { persistSession: false } });

const ADMIN_EMAIL = "official.privatechat0378@gmail.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";

// Emails that earlier versions of this seed created. They are removed so the
// console is not left showing fictional customers.
const LEGACY_DEMO_EMAILS = [
  "sarah@jenkins.co",
  "john.doe@icloud.com",
  "maria@santos.br",
  "alex@chen.sg",
  "priya@patel.in",
  "omar@hassan.ae",
  "lisa@park.kr",
  "daniel@cruz.mx",
  "admin@vault.io",
];

async function must(label, promise) {
  const { error, data } = await promise;
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
  return data;
}

/**
 * PostgREST fills a missing key in a multi-row insert with NULL instead of the
 * column default, so every row in a batch must carry the same keys. This
 * squares up the rows, using `defaults` for NOT NULL columns.
 */
function rows(list, defaults = {}) {
  const keys = new Set(Object.keys(defaults));
  for (const r of list) for (const k of Object.keys(r)) keys.add(k);
  return list.map((r) => {
    const out = {};
    for (const k of keys) {
      out[k] =
        r[k] !== undefined ? r[k] : defaults[k] !== undefined ? defaults[k] : null;
    }
    return out;
  });
}

const insertAll = (table, defaults, list) =>
  db.from(table).insert(rows(list, defaults));

/** Every auth user, paged. */
async function listAuthUsers() {
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const batch = data?.users ?? [];
    all.push(...batch);
    if (batch.length < 200) break;
  }
  return all;
}

async function ensureUser(email, password, name) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (!error) return data.user.id;

  // Already there — find it and reset the password so the credentials hold.
  const found = (await listAuthUsers()).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  if (!found) {
    console.error(`✗ could not create or find auth user ${email}`);
    process.exit(1);
  }
  await db.auth.admin.updateUserById(found.id, { password });
  return found.id;
}

async function main() {
  // ---------------------------------------------------------------------
  // Clear everything the platform does not own
  // ---------------------------------------------------------------------
  console.log("Clearing tables…");
  for (const t of [
    "card_authorizations",
    "cards",
    "devices",
    "transactions",
    "recipients",
    "user_settings",
    "wallets",
    "kyc_documents",
    "kyc_applications",
    "support_messages",
    "transfers",
    "risk_flags",
    "detection_rules",
    "fees",
    "alerts",
    "gateways",
    "fx_rates",
    "profiles",
  ]) {
    await db.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }

  // Drop the fictional auth users older seeds created, so auth.users lines up
  // with the (now empty) profiles table.
  const existing = await listAuthUsers();
  for (const u of existing) {
    if (LEGACY_DEMO_EMAILS.includes((u.email ?? "").toLowerCase())) {
      await db.auth.admin.deleteUser(u.id);
      console.log(`  removed legacy demo user ${u.email}`);
    }
  }

  // ---------------------------------------------------------------------
  // Admin account
  // ---------------------------------------------------------------------
  console.log("Creating admin account…");
  const adminId = await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, "Platform Admin");

  await must(
    "profiles",
    db.from("profiles").insert({
      id: adminId,
      email: ADMIN_EMAIL,
      role: "ADMIN",
      name: "Platform Admin",
      handle: "@official_admin",
      avatar: "/avatars/sarah.png",
      title: "System Overseer",
      country: "🇺🇸",
      tier: "Tier 3",
      kycStatus: "Verified",
      riskScore: 0,
      flagged: false,
      joined: new Date().toISOString(),
    }),
  );

  // Treasury the admin disburses demo funds from.
  console.log("Funding admin treasury…");
  await must(
    "wallets",
    insertAll("wallets", { primary: false, pending: 0 }, [
      { ownerId: adminId, currency: "USD", symbol: "$", balance: 1000000, available: 1000000, changeLabel: "Treasury", changeTone: "flat", primary: true, sort: 0 },
      { ownerId: adminId, currency: "EUR", symbol: "€", balance: 500000, available: 500000, changeLabel: "Treasury", changeTone: "flat", sort: 1 },
      { ownerId: adminId, currency: "GBP", symbol: "£", balance: 400000, available: 400000, changeLabel: "Treasury", changeTone: "flat", sort: 2 },
      { ownerId: adminId, currency: "CAD", symbol: "$", balance: 600000, available: 600000, changeLabel: "Treasury", changeTone: "flat", sort: 3 },
    ]),
  );

  await must(
    "user_settings",
    db.from("user_settings").insert({ ownerId: adminId }),
  );

  // ---------------------------------------------------------------------
  // Platform reference data
  // ---------------------------------------------------------------------
  console.log("Inserting FX rates…");
  await must(
    "fx_rates",
    insertAll("fx_rates", {}, [
      { base: "USD", quote: "EUR", rate: 0.9215, change: "-0.12%", changeTone: "down", spread: "0.25%", sort: 0 },
      { base: "USD", quote: "GBP", rate: 0.7852, change: "+0.18%", changeTone: "up", spread: "0.25%", sort: 1 },
      { base: "USD", quote: "CAD", rate: 1.3712, change: "-0.08%", changeTone: "down", spread: "0.30%", sort: 2 },
      { base: "EUR", quote: "GBP", rate: 0.8521, change: "+0.05%", changeTone: "up", spread: "0.35%", sort: 3 },
      { base: "EUR", quote: "USD", rate: 1.0852, change: "+0.12%", changeTone: "up", spread: "0.25%", sort: 4 },
      { base: "EUR", quote: "CAD", rate: 1.4880, change: "-0.04%", changeTone: "down", spread: "0.35%", sort: 5 },
      { base: "GBP", quote: "USD", rate: 1.2736, change: "-0.18%", changeTone: "down", spread: "0.25%", sort: 6 },
      { base: "GBP", quote: "EUR", rate: 1.1736, change: "-0.05%", changeTone: "down", spread: "0.35%", sort: 7 },
      { base: "GBP", quote: "CAD", rate: 1.7463, change: "+0.02%", changeTone: "up", spread: "0.35%", sort: 8 },
      { base: "CAD", quote: "USD", rate: 0.7293, change: "+0.08%", changeTone: "up", spread: "0.30%", sort: 9 },
      { base: "CAD", quote: "EUR", rate: 0.6720, change: "+0.04%", changeTone: "up", spread: "0.35%", sort: 10 },
      { base: "CAD", quote: "GBP", rate: 0.5726, change: "-0.02%", changeTone: "down", spread: "0.35%", sort: 11 },
      { base: "USD", quote: "USD", rate: 1, change: "Stable", changeTone: "flat", spread: "0.00%", sort: 12 },
    ]),
  );

  console.log("Inserting fee schedule…");
  await must(
    "fees",
    insertAll("fees", {}, [
      { name: "Internal Transfer", category: "Platform", detail: "Account-to-account instant", amount: "$0.00", tier: "All tiers", sort: 0 },
      { name: "ACH Transfer", category: "Domestic", detail: "1–3 business days", amount: "$5.00", tier: "All tiers", sort: 1 },
      { name: "SWIFT Wire", category: "International", detail: "Cross-border settlement", amount: "$15.00", tier: "Tier 1–2", sort: 2 },
      { name: "SWIFT Wire", category: "International", detail: "Cross-border settlement", amount: "$8.00", tier: "Tier 3", sort: 3 },
      { name: "FX Conversion", category: "Exchange", detail: "Spread over mid-market", amount: "0.25%", tier: "All tiers", sort: 4 },
      { name: "Card Issuance", category: "Cards", detail: "Physical card, one-time", amount: "$9.99", tier: "All tiers", sort: 5 },
      { name: "Instant Payout", category: "Cards", detail: "Push-to-card acceleration", amount: "1.50%", tier: "All tiers", sort: 6 },
      { name: "Account Maintenance", category: "Platform", detail: "Monthly, waived over $10k", amount: "$0.00", tier: "Tier 3", sort: 7 },
    ]),
  );

  console.log("Inserting gateways…");
  await must(
    "gateways",
    insertAll("gateways", {}, [
      { name: "SWIFT Network", status: "Operational", tone: "text-emerald-500", sort: 0 },
      { name: "USD Settlement", status: "Operational", tone: "text-emerald-500", sort: 1 },
      { name: "KYC Synapse", status: "Operational", tone: "text-emerald-500", sort: 2 },
      { name: "Ledger Core", status: "Operational", tone: "text-emerald-500", sort: 3 },
    ]),
  );

  console.log("Inserting detection rules…");
  await must(
    "detection_rules",
    insertAll("detection_rules", {}, [
      { label: "Velocity monitoring", desc: "Rapid successive transfers", enabled: true, sort: 0 },
      { label: "Geo-anomaly detection", desc: "Impossible-travel logins", enabled: true, sort: 1 },
      { label: "Sanctions / PEP screening", desc: "OFAC & watchlist match", enabled: true, sort: 2 },
      { label: "Device fingerprinting", desc: "New / spoofed devices", enabled: true, sort: 3 },
      { label: "Auto-freeze on score > 90", desc: "Suspend without review", enabled: false, sort: 4 },
    ]),
  );

  console.log("\n✅ Seed complete — platform is empty and ready.\n");
  console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("   Customers: none. Sign up through /signup to create one.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Seed the Profintal Savings Supabase project.
//
//   node scripts/seed.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env/.env.local.
// Idempotent: clears the app tables, then recreates auth users + demo data.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

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
    )
      v = v.slice(1, -1);
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
const iso = (s) => new Date(s).toISOString();

async function must(label, promise) {
  const { error, data } = await promise;
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
  return data;
}

/** Create an auth user, reusing the existing one if the email is taken. */
async function ensureUser(email, password, name) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (!error && data?.user) return data.user.id;

  // Already exists — look it up.
  let page = 1;
  for (;;) {
    const { data: list } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const found = list?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) {
      await db.auth.admin.updateUserById(found.id, { password });
      return found.id;
    }
    if (!list?.users?.length || list.users.length < 200) break;
    page += 1;
  }
  throw new Error(`Could not create or find auth user ${email}: ${error?.message}`);
}

async function main() {
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

  // -------------------------------------------------------------------------
  // Accounts
  // -------------------------------------------------------------------------
  console.log("Creating auth users…");
  const sarahId = await ensureUser("sarah@jenkins.co", "vault123", "Sarah Jenkins");
  const adminId = await ensureUser(
    "official.privatechat0378@gmail.com",
    "admin123",
    "Platform Admin",
  );

  const directory = [
    { email: "john.doe@icloud.com", name: "John Doe", handle: "@john_doe", avatar: "/avatars/john.png", country: "🇺🇸", tier: "Tier 3", kycStatus: "Verified", riskScore: 12, joined: "2025-01-12" },
    { email: "maria@santos.br", name: "Maria Santos", handle: "@maria_s", avatar: "/avatars/maria.png", country: "🇧🇷", tier: "Tier 2", kycStatus: "Pending", riskScore: 24, flagged: true, joined: "2025-03-08" },
    { email: "alex@chen.sg", name: "Alex Chen", handle: "@achen", avatar: "/avatars/alex.png", country: "🇸🇬", tier: "Tier 3", kycStatus: "Verified", riskScore: 15, joined: "2025-02-19" },
    { email: "priya@patel.in", name: "Priya Patel", handle: "@priya_p", avatar: "/avatars/priya.png", country: "🇮🇳", tier: "Tier 1", kycStatus: "Pending", riskScore: 41, joined: "2025-05-15" },
    { email: "omar@hassan.ae", name: "Omar Hassan", handle: "@omar_h", avatar: "/avatars/omar.png", country: "🇦🇪", tier: "Tier 2", kycStatus: "Frozen", riskScore: 63, joined: "2025-04-30" },
    { email: "lisa@park.kr", name: "Lisa Park", handle: "@lisapark", avatar: "/avatars/lisa.png", country: "🇰🇷", tier: "Tier 3", kycStatus: "Verified", riskScore: 19, joined: "2025-06-11" },
    { email: "daniel@cruz.mx", name: "Daniel Cruz", handle: "@dcruz", avatar: "/avatars/priya.png", country: "🇲🇽", tier: "Tier 1", kycStatus: "Rejected", riskScore: 85, flagged: true, joined: "2025-07-22" },
  ];

  const ids = {};
  for (const u of directory) {
    ids[u.name] = await ensureUser(u.email, "vault123", u.name);
  }

  console.log("Inserting profiles…");
  await must(
    "profiles",
    db.from("profiles").insert([
      { id: sarahId, email: "sarah@jenkins.co", role: "CUSTOMER", name: "Sarah Jenkins", handle: "@sarah_j", avatar: "/avatars/sarah.png", title: "Primary Administrator", country: "🇺🇸", tier: "Tier 3", kycStatus: "Verified", riskScore: 8, joined: iso("2024-11-02") },
      { id: adminId, email: "official.privatechat0378@gmail.com", role: "ADMIN", name: "Platform Admin", handle: "@official_admin", avatar: "/avatars/sarah.png", title: "System Overseer", country: "🇺🇸", tier: "Tier 3", kycStatus: "Verified", riskScore: 2, joined: iso("2023-01-15") },
      ...directory.map((u) => ({
        id: ids[u.name],
        email: u.email,
        role: "CUSTOMER",
        name: u.name,
        handle: u.handle,
        avatar: u.avatar,
        country: u.country,
        tier: u.tier,
        kycStatus: u.kycStatus,
        riskScore: u.riskScore,
        flagged: !!u.flagged,
        joined: iso(u.joined),
      })),
    ]),
  );

  // -------------------------------------------------------------------------
  // Wallets
  // -------------------------------------------------------------------------
  console.log("Inserting wallets…");
  await must(
    "wallets",
    db.from("wallets").insert([
      { ownerId: sarahId, currency: "USD", symbol: "$", balance: 12500, available: 12350, pending: 150, changeLabel: "+0.04%", changeTone: "up", primary: true, sort: 0, accountHolder: "Sarah Jenkins", accountNumber: "8827 4491 2203", achRouting: "021000021", wireRouting: "026009593", bankName: "Profintal Savings, Inc.", bankAddress: "1 Market Street, San Francisco, CA 94105", swift: "PFSVUS33" },
      { ownerId: sarahId, currency: "EUR", symbol: "€", balance: 4820.5, changeLabel: "-0.12%", changeTone: "down", sort: 1 },
      { ownerId: sarahId, currency: "GBP", symbol: "£", balance: 2420, changeLabel: "+0.18%", changeTone: "up", sort: 2 },
      { ownerId: sarahId, currency: "NGN", symbol: "₦", balance: 3850000, changeLabel: "Stable", changeTone: "flat", sort: 3 },
      { ownerId: sarahId, currency: "CAD", symbol: "$", balance: 1250, changeLabel: "-0.08%", changeTone: "down", sort: 4 },
      // Admin treasury
      { ownerId: adminId, currency: "USD", symbol: "$", balance: 1000000, available: 1000000, pending: 0, changeLabel: "Treasury", changeTone: "flat", primary: true, sort: 0 },
      { ownerId: adminId, currency: "EUR", symbol: "€", balance: 500000, available: 500000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 1 },
      { ownerId: adminId, currency: "GBP", symbol: "£", balance: 400000, available: 400000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 2 },
      { ownerId: adminId, currency: "NGN", symbol: "₦", balance: 900000000, available: 900000000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 3 },
      { ownerId: adminId, currency: "CAD", symbol: "$", balance: 600000, available: 600000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 4 },
    ]),
  );

  await must(
    "user_settings",
    db.from("user_settings").insert({ ownerId: sarahId, dailyUsed: 25000, monthlyUsed: 150000 }),
  );

  // -------------------------------------------------------------------------
  // Transactions
  // -------------------------------------------------------------------------
  console.log("Inserting transactions…");
  const txns = [
    { ref: "TXN-2026-00847", date: "2026-06-15T09:41:00Z", kind: "send", title: "John Doe", sub: "User @john_doe", currency: "USD", amount: -500, fee: 0, status: "Completed", party: "John Doe", partySub: "@john_doe", route: "Internal", risk: "Low", reference: "#PFS-8849-01", walletSource: "US Dollar Wallet", delivery: "Instantaneous" },
    { ref: "TXN-2026-00848", date: "2026-06-14T14:05:00Z", kind: "receive", title: "Maria Santos", sub: "Wise payout incoming", currency: "EUR", amount: 1200, fee: 1.5, status: "Completed", party: "Maria Santos", partySub: "Wise payout", route: "SWIFT Wire", risk: "Low" },
    { ref: "TXN-2026-00849", date: "2026-06-13T11:20:00Z", kind: "convert", title: "USD → NGN conversion", sub: "Platform swap loop", currency: "NGN", amount: 1500000, fee: 2.5, status: "Completed", party: "FX Desk", partySub: "USD → NGN", route: "FX Swap", risk: "Medium" },
    { ref: "TXN-2026-00850", date: "2026-06-12T16:32:00Z", kind: "wire", title: "Banco do Brasil", sub: "Wire to Maria Santos", currency: "USD", amount: -2500, fee: 15, status: "Processing", party: "Banco do Brasil", partySub: "Maria Santos", route: "SWIFT Wire", risk: "Medium" },
    { ref: "TXN-2026-00851", date: "2026-06-11T08:15:00Z", kind: "ach", title: "Chase Bank ACH", sub: "Sarah Jenkins personal", currency: "USD", amount: 5000, fee: 0, status: "Pending", party: "Chase Bank", partySub: "ACH credit", route: "ACH", risk: "Low" },
    { ref: "TXN-2026-00852", date: "2026-06-10T13:44:00Z", kind: "send", title: "Alex Chen", sub: "User @achen", currency: "GBP", amount: -300, fee: 0, status: "Completed", party: "Alex Chen", partySub: "@achen", route: "Internal", risk: "Low" },
    { ref: "TXN-2026-00853", date: "2026-06-09T10:02:00Z", kind: "ach", title: "Wells Fargo account", sub: "Ending ****4521", currency: "USD", amount: -1000, fee: 5, status: "Completed", party: "Wells Fargo", partySub: "****4521", route: "ACH", risk: "Low" },
    { ref: "TXN-2026-00854", date: "2026-06-08T09:00:00Z", kind: "receive", title: "Payroll", sub: "Platform automated payout", currency: "USD", amount: 750, fee: 0, status: "Completed", party: "Payroll", partySub: "Automated", route: "Internal", risk: "Low" },
    { ref: "TXN-2026-00855", date: "2026-06-07T17:28:00Z", kind: "wire", title: "Lagos Corp", sub: "Corporate node transfer", currency: "USD", amount: -3000, fee: 25, status: "Failed", party: "Lagos Corp", partySub: "Corporate node", route: "SWIFT Wire", risk: "High", flagged: true },
    { ref: "TXN-2026-00856", date: "2026-06-06T12:11:00Z", kind: "convert", title: "EUR → GBP conversion", sub: "Direct FX pricing", currency: "GBP", amount: 430, fee: 1, status: "Completed", party: "FX Desk", partySub: "EUR → GBP", route: "FX Swap", risk: "Low" },
  ];
  await must(
    "transactions",
    db.from("transactions").insert(
      txns.map((t) => ({ ...t, ownerId: sarahId, date: iso(t.date) })),
    ),
  );

  // -------------------------------------------------------------------------
  // Recipients / cards / devices
  // -------------------------------------------------------------------------
  console.log("Inserting recipients, cards, devices…");
  await must(
    "recipients",
    db.from("recipients").insert([
      { ownerId: sarahId, type: "USER", name: "John Doe", handle: "@john_doe", avatar: "/avatars/john.png", favorite: true, lastSent: iso("2026-06-15") },
      { ownerId: sarahId, type: "USER", name: "Maria Santos", handle: "@maria_s", avatar: "/avatars/maria.png", lastSent: iso("2026-06-02") },
      { ownerId: sarahId, type: "USER", name: "Alex Chen", handle: "@achen", avatar: "/avatars/alex.png", favorite: true, lastSent: iso("2026-05-28") },
      { ownerId: sarahId, type: "USER", name: "Priya Patel", handle: "@priya_p", avatar: "/avatars/priya.png", lastSent: iso("2026-05-15") },
      { ownerId: sarahId, type: "USER", name: "Omar Hassan", handle: "@omar_h", avatar: "/avatars/omar.png", lastSent: iso("2026-04-30") },
      { ownerId: sarahId, type: "USER", name: "Lisa Park", handle: "@lisapark", avatar: "/avatars/lisa.png", lastSent: iso("2026-04-12") },
      { ownerId: sarahId, type: "BANK", name: "Maria Santos", flag: "🇧🇷", bankName: "Banco do Brasil", accountMask: "****4521", lastSent: iso("2026-06-12") },
    ]),
  );

  const card = await must(
    "cards",
    db
      .from("cards")
      .insert({ ownerId: sarahId, name: "Profintal Premium", brand: "AMEX", last4: "1005", holder: "Sarah Jenkins", expiry: "12/30", spent: 1120.4, limit: 10000 })
      .select()
      .single(),
  );

  await must(
    "card_authorizations",
    db.from("card_authorizations").insert([
      { cardId: card.id, merchant: "Github Enterprise", category: "Developer Tools", when: "Today, 10:15 AM", amount: -19, sort: 0 },
      { cardId: card.id, merchant: "Apple App Store", category: "Entertainment", when: "Yesterday, 04:15 PM", amount: -4.99, sort: 1 },
      { cardId: card.id, merchant: "Starbucks Coffee", category: "Food & Beverage", when: "Yesterday, 09:42 AM", amount: -6.8, sort: 2 },
      { cardId: card.id, merchant: "Herman Miller Inc", category: "Furniture & Decor", when: "June 08, 2026", amount: -1299, sort: 3 },
    ]),
  );

  await must(
    "devices",
    db.from("devices").insert([
      { ownerId: sarahId, kind: "laptop", name: 'MacBook Pro 14"', meta: "San Francisco • Active Now", current: true, sort: 0 },
      { ownerId: sarahId, kind: "phone", name: "iPhone 15 Pro", meta: "San Francisco • 2 Hours Ago", sort: 1 },
      { ownerId: sarahId, kind: "tablet", name: "iPad Air", meta: "New York • 3 Days Ago", sort: 2 },
    ]),
  );

  // -------------------------------------------------------------------------
  // FX rates
  // -------------------------------------------------------------------------
  console.log("Inserting FX rates…");
  await must(
    "fx_rates",
    db.from("fx_rates").insert([
      { base: "USD", quote: "EUR", rate: 0.9215, change: "-0.12%", changeTone: "down", spread: "0.25%", sort: 0 },
      { base: "USD", quote: "GBP", rate: 0.7852, change: "+0.18%", changeTone: "up", spread: "0.25%", sort: 1 },
      { base: "USD", quote: "NGN", rate: 1500, change: "Stable", changeTone: "flat", spread: "0.75%", sort: 2 },
      { base: "USD", quote: "CAD", rate: 1.3712, change: "-0.08%", changeTone: "down", spread: "0.30%", sort: 3 },
      { base: "EUR", quote: "GBP", rate: 0.8521, change: "+0.05%", changeTone: "up", spread: "0.35%", sort: 4 },
      { base: "EUR", quote: "USD", rate: 1.0852, change: "+0.12%", changeTone: "up", spread: "0.25%", sort: 5 },
      { base: "GBP", quote: "USD", rate: 1.2736, change: "-0.18%", changeTone: "down", spread: "0.25%", sort: 6 },
      { base: "NGN", quote: "USD", rate: 0.000667, change: "Stable", changeTone: "flat", spread: "0.75%", sort: 7 },
      { base: "CAD", quote: "USD", rate: 0.7293, change: "+0.08%", changeTone: "up", spread: "0.30%", sort: 8 },
      { base: "USD", quote: "USD", rate: 1, change: "Stable", changeTone: "flat", spread: "0.00%", sort: 9 },
    ]),
  );

  // -------------------------------------------------------------------------
  // KYC
  // -------------------------------------------------------------------------
  console.log("Inserting KYC applications…");
  const kycSeed = [
    { name: "Maria Santos", requesting: "Tier 2 → 3", docs: "3 documents", submitted: "2 hours ago", risk: 24, riskTone: "text-emerald-500", status: "pending", escalated: false },
    { name: "Priya Patel", requesting: "Tier 1 → 2", docs: "2 documents", submitted: "5 hours ago", risk: 41, riskTone: "text-amber-500", status: "pending", escalated: false },
    { name: "Omar Hassan", requesting: "Tier 2 → 3", docs: "4 documents", submitted: "1 day ago", risk: 63, riskTone: "text-amber-500", status: "escalated", escalated: true },
    { name: "Daniel Cruz", requesting: "Tier 1 → 2", docs: "1 document", submitted: "2 days ago", risk: 85, riskTone: "text-red-500", status: "escalated", escalated: true },
    { name: "Lisa Park", requesting: "Tier 2 → 3", docs: "3 documents", submitted: "3 days ago", risk: 19, riskTone: "text-emerald-500", status: "pending", escalated: false },
    { name: "Alex Chen", requesting: "Tier 2 → 3", docs: "3 documents", submitted: "4 days ago", risk: 15, riskTone: "text-emerald-500", status: "pending", escalated: false },
  ];
  for (const k of kycSeed) {
    const app = await must(
      "kyc_applications",
      db
        .from("kyc_applications")
        .insert({ userId: ids[k.name], requesting: k.requesting, docs: k.docs, submitted: k.submitted, risk: k.risk, riskTone: k.riskTone, status: k.status, escalated: k.escalated })
        .select()
        .single(),
    );
    await must(
      "kyc_documents",
      db.from("kyc_documents").insert([
        { appId: app.id, label: "Government ID", status: "Verified", sort: 0 },
        { appId: app.id, label: "Proof of Address", status: "Verified", sort: 1 },
        { appId: app.id, label: "Biometric Liveness", status: k.risk > 50 ? "Pending" : "Verified", sort: 2 },
        { appId: app.id, label: "Sanctions Screening", status: "Cleared", sort: 3 },
      ]),
    );
  }

  // -------------------------------------------------------------------------
  // Admin widgets
  // -------------------------------------------------------------------------
  console.log("Inserting transfers, risk, fees, alerts, gateways…");
  await must(
    "transfers",
    db.from("transfers").insert([
      { ref: "TRF-2026-0472", party: "Lagos Corp", partySub: "Corporate node transfer", route: "SWIFT Wire", amount: 15000, status: "Pending", risk: "High", submitted: "12 min ago" },
      { ref: "TRF-2026-0473", party: "Maria Santos", partySub: "Banco do Brasil", route: "SWIFT Wire", amount: 2500, status: "Pending", risk: "Medium", submitted: "44 min ago" },
      { ref: "TRF-2026-0474", party: "Chase Bank", partySub: "ACH settlement", route: "ACH", amount: 5000, status: "Pending", risk: "Low", submitted: "1 hour ago" },
      { ref: "TRF-2026-0475", party: "Alex Chen", partySub: "Internal transfer", route: "Internal", amount: 300, status: "Authorized", risk: "Low", submitted: "2 hours ago" },
      { ref: "TRF-2026-0476", party: "Priya Patel", partySub: "FX settlement", route: "FX Swap", amount: 1200, status: "Pending", risk: "Medium", submitted: "3 hours ago" },
      { ref: "TRF-2026-0477", party: "Omar Hassan", partySub: "Wire out", route: "SWIFT Wire", amount: 9800, status: "Rejected", risk: "High", submitted: "5 hours ago" },
      { ref: "TRF-2026-0478", party: "Wells Fargo", partySub: "ACH debit", route: "ACH", amount: 1000, status: "Authorized", risk: "Low", submitted: "6 hours ago" },
    ]),
  );

  await must(
    "risk_flags",
    db.from("risk_flags").insert([
      { account: "User #4821", accountSub: "Unknown recipient", trigger: "Velocity + new payee", score: 92, amount: 15000, when: "12 min ago", critical: true },
      { account: "User #1120", accountSub: "Lagos Corp", trigger: "Sanctions match (weak)", score: 88, amount: 9800, when: "1 hour ago" },
      { account: "User #2847", accountSub: "Daniel Cruz", trigger: "Daily limit breach", score: 85, amount: 12500, when: "3 hours ago" },
      { account: "User #7392", accountSub: "Omar Hassan", trigger: "Geo-anomaly login", score: 78, amount: 2500, when: "4 hours ago" },
      { account: "User #5567", accountSub: "Priya Patel", trigger: "Device fingerprint mismatch", score: 66, amount: 1200, when: "6 hours ago" },
    ]),
  );

  await must(
    "detection_rules",
    db.from("detection_rules").insert([
      { label: "Velocity monitoring", desc: "Rapid successive transfers", enabled: true, sort: 0 },
      { label: "Geo-anomaly detection", desc: "Impossible-travel logins", enabled: true, sort: 1 },
      { label: "Sanctions / PEP screening", desc: "OFAC & watchlist match", enabled: true, sort: 2 },
      { label: "Device fingerprinting", desc: "New / spoofed devices", enabled: true, sort: 3 },
      { label: "Auto-freeze on score > 90", desc: "Suspend without review", enabled: false, sort: 4 },
    ]),
  );

  await must(
    "fees",
    db.from("fees").insert([
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

  await must(
    "gateways",
    db.from("gateways").insert([
      { name: "SWIFT Network", status: "Operational", tone: "text-emerald-500", sort: 0 },
      { name: "USD Settlement", status: "Healthy", tone: "text-emerald-500", sort: 1 },
      { name: "KYC Synapse", status: "Degraded", tone: "text-amber-500", sort: 2 },
      { name: "Ledger Core", status: "Operational", tone: "text-emerald-500", sort: 3 },
    ]),
  );

  await must(
    "alerts",
    db.from("alerts").insert([
      { severity: "critical", title: "High-risk transfer flagged", detail: "User #4821 — velocity + new payee", when: "12 min ago", sort: 0 },
      { severity: "medium", title: "Sanctions weak match", detail: "Lagos Corp settlement held", when: "1 hour ago", sort: 1 },
      { severity: "warning", title: "KYC Synapse degraded", detail: "Verification latency above SLA", when: "2 hours ago", sort: 2 },
      { severity: "notice", title: "Daily volume milestone", detail: "Platform crossed $2M settled", when: "4 hours ago", sort: 3 },
    ]),
  );

  console.log("\n✅ Seed complete.\n");
  console.log("   Customer: sarah@jenkins.co / vault123");
  console.log("   Admin:    official.privatechat0378@gmail.com / admin123\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Seed the Vault prototype database. Idempotent: clears every table, then
// recreates the demo customer (Sarah), an admin, the platform directory, and
// all supporting records that the customer + admin screens render.
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

const d = (s) => new Date(s);

async function main() {
  // Clear in dependency order (children first).
  await prisma.cardAuthorization.deleteMany();
  await prisma.card.deleteMany();
  await prisma.device.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recipient.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.kycApplication.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.riskFlag.deleteMany();
  await prisma.detectionRule.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.gateway.deleteMany();
  await prisma.fxRate.deleteMany();
  await prisma.user.deleteMany();

  // -------------------------------------------------------------------------
  // Customer: Sarah Jenkins
  // -------------------------------------------------------------------------
  const sarah = await prisma.user.create({
    data: {
      email: "sarah@jenkins.co",
      password: "vault123",
      role: "CUSTOMER",
      name: "Sarah Jenkins",
      handle: "@sarah_j",
      avatar: "/avatars/sarah.png",
      title: "Primary Administrator",
      country: "🇺🇸",
      tier: "Tier 3",
      kycStatus: "Verified",
      riskScore: 8,
      joined: d("2024-11-02"),
    },
  });

  // -------------------------------------------------------------------------
  // Admin
  // -------------------------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      email: "admin@vault.io",
      password: "admin123",
      role: "ADMIN",
      name: "Admin Node 04",
      handle: "@overseer",
      avatar: "/avatars/sarah.png",
      title: "System Overseer",
      country: "🇺🇸",
      tier: "Tier 3",
      kycStatus: "Verified",
      riskScore: 2,
      joined: d("2023-01-15"),
    },
  });

  // Admin treasury — funded wallets used by the "Send Funds to any user"
  // admin feature. These are the demo funds the operator disburses.
  await prisma.wallet.createMany({
    data: [
      { ownerId: admin.id, currency: "USD", symbol: "$", balance: 1_000_000, available: 1_000_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", primary: true, sort: 0 },
      { ownerId: admin.id, currency: "EUR", symbol: "€", balance: 500_000, available: 500_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 1 },
      { ownerId: admin.id, currency: "GBP", symbol: "£", balance: 400_000, available: 400_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 2 },
      { ownerId: admin.id, currency: "NGN", symbol: "₦", balance: 900_000_000, available: 900_000_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 3 },
      { ownerId: admin.id, currency: "CAD", symbol: "$", balance: 600_000, available: 600_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 4 },
    ],
  });

  // Personal admin account (promoted per user request) with its own treasury.
  const adminAvatarSvg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' rx='48' fill='#f59e0b'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='sans-serif' font-weight='700' font-size='36' fill='white'>PA</text></svg>";
  const admin2 = await prisma.user.create({
    data: {
      email: "official.privatechat0378@gmail.com",
      password: "admin123",
      role: "ADMIN",
      name: "Platform Admin",
      handle: "@official_admin",
      avatar: `data:image/svg+xml;utf8,${encodeURIComponent(adminAvatarSvg)}`,
      title: "System Overseer",
      country: "🇺🇸",
      tier: "Tier 3",
      kycStatus: "Verified",
      riskScore: 2,
      joined: d("2023-01-15"),
    },
  });
  await prisma.wallet.createMany({
    data: [
      { ownerId: admin2.id, currency: "USD", symbol: "$", balance: 1_000_000, available: 1_000_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", primary: true, sort: 0 },
      { ownerId: admin2.id, currency: "EUR", symbol: "€", balance: 500_000, available: 500_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 1 },
      { ownerId: admin2.id, currency: "GBP", symbol: "£", balance: 400_000, available: 400_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 2 },
      { ownerId: admin2.id, currency: "NGN", symbol: "₦", balance: 900_000_000, available: 900_000_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 3 },
      { ownerId: admin2.id, currency: "CAD", symbol: "$", balance: 600_000, available: 600_000, pending: 0, changeLabel: "Treasury", changeTone: "flat", sort: 4 },
    ],
  });

  // -------------------------------------------------------------------------
  // Platform directory (customers surfaced in the admin console + recipients)
  // -------------------------------------------------------------------------
  const directory = [
    { email: "john.doe@icloud.com", name: "John Doe", handle: "@john_doe", avatar: "/avatars/john.png", country: "🇺🇸", tier: "Tier 3", kycStatus: "Verified", riskScore: 12, joined: d("2025-01-12") },
    { email: "maria@santos.br", name: "Maria Santos", handle: "@maria_s", avatar: "/avatars/maria.png", country: "🇧🇷", tier: "Tier 2", kycStatus: "Pending", riskScore: 24, flagged: true, joined: d("2025-03-08") },
    { email: "alex@chen.sg", name: "Alex Chen", handle: "@achen", avatar: "/avatars/alex.png", country: "🇸🇬", tier: "Tier 3", kycStatus: "Verified", riskScore: 15, joined: d("2025-02-19") },
    { email: "priya@patel.in", name: "Priya Patel", handle: "@priya_p", avatar: "/avatars/priya.png", country: "🇮🇳", tier: "Tier 1", kycStatus: "Pending", riskScore: 41, joined: d("2025-05-15") },
    { email: "omar@hassan.ae", name: "Omar Hassan", handle: "@omar_h", avatar: "/avatars/omar.png", country: "🇦🇪", tier: "Tier 2", kycStatus: "Frozen", riskScore: 63, joined: d("2025-04-30") },
    { email: "lisa@park.kr", name: "Lisa Park", handle: "@lisapark", avatar: "/avatars/lisa.png", country: "🇰🇷", tier: "Tier 3", kycStatus: "Verified", riskScore: 19, joined: d("2025-06-11") },
    { email: "daniel@cruz.mx", name: "Daniel Cruz", handle: "@dcruz", avatar: "/avatars/priya.png", country: "🇲🇽", tier: "Tier 1", kycStatus: "Rejected", riskScore: 85, flagged: true, joined: d("2025-07-22") },
  ];
  const users = {};
  for (const u of directory) {
    users[u.name] = await prisma.user.create({ data: { ...u, role: "CUSTOMER", password: "vault123" } });
  }

  // -------------------------------------------------------------------------
  // Sarah's wallets (primary USD wallet carries the receiving details)
  // -------------------------------------------------------------------------
  await prisma.wallet.create({
    data: {
      ownerId: sarah.id, currency: "USD", symbol: "$", balance: 12500, available: 12350, pending: 150,
      changeLabel: "+0.04%", changeTone: "up", primary: true, sort: 0,
      accountHolder: "Sarah Jenkins", accountNumber: "8827 4491 2203", achRouting: "021000021",
      wireRouting: "026009593", bankName: "Vault Financial, Inc.",
      bankAddress: "1 Market Street, San Francisco, CA 94105", swift: "VLTFUS33",
    },
  });
  await prisma.wallet.createMany({
    data: [
      { ownerId: sarah.id, currency: "EUR", symbol: "€", balance: 4820.5, changeLabel: "-0.12%", changeTone: "down", sort: 1 },
      { ownerId: sarah.id, currency: "GBP", symbol: "£", balance: 2420, changeLabel: "+0.18%", changeTone: "up", sort: 2 },
      { ownerId: sarah.id, currency: "NGN", symbol: "₦", balance: 3850000, changeLabel: "Stable", changeTone: "flat", sort: 3 },
      { ownerId: sarah.id, currency: "CAD", symbol: "$", balance: 1250, changeLabel: "-0.08%", changeTone: "down", sort: 4 },
    ],
  });

  await prisma.userSettings.create({ data: { ownerId: sarah.id, dailyUsed: 25000, monthlyUsed: 150000 } });

  // -------------------------------------------------------------------------
  // Sarah's transactions (customer ledger + admin ledger view share these).
  // kind maps to an icon in the UI; amount is signed.
  // -------------------------------------------------------------------------
  const txns = [
    { ref: "TXN-2026-00847", date: d("2026-06-15T09:41:00"), kind: "send", title: "John Doe", sub: "User @john_doe", currency: "USD", amount: -500, fee: 0, status: "Completed", party: "John Doe", partySub: "@john_doe", route: "Internal", risk: "Low", reference: "#VLT-8849-01", walletSource: "US Dollar Wallet", delivery: "Instantaneous" },
    { ref: "TXN-2026-00848", date: d("2026-06-14T14:05:00"), kind: "receive", title: "Maria Santos", sub: "Wise payout incoming", currency: "EUR", amount: 1200, fee: 1.5, status: "Completed", party: "Maria Santos", partySub: "Wise payout", route: "SWIFT Wire", risk: "Low" },
    { ref: "TXN-2026-00849", date: d("2026-06-13T11:20:00"), kind: "convert", title: "USD → NGN conversion", sub: "Platform swap loop", currency: "NGN", amount: 1500000, fee: 2.5, status: "Completed", party: "FX Desk", partySub: "USD → NGN", route: "FX Swap", risk: "Medium" },
    { ref: "TXN-2026-00850", date: d("2026-06-12T16:32:00"), kind: "wire", title: "Banco do Brasil", sub: "Wire to Maria Santos", currency: "USD", amount: -2500, fee: 15, status: "Processing", party: "Banco do Brasil", partySub: "Maria Santos", route: "SWIFT Wire", risk: "Medium" },
    { ref: "TXN-2026-00851", date: d("2026-06-11T08:15:00"), kind: "ach", title: "Chase Bank ACH", sub: "Sarah Jenkins personal", currency: "USD", amount: 5000, fee: 0, status: "Pending", party: "Chase Bank", partySub: "ACH credit", route: "ACH", risk: "Low" },
    { ref: "TXN-2026-00852", date: d("2026-06-10T13:44:00"), kind: "send", title: "Alex Chen", sub: "User @achen", currency: "GBP", amount: -300, fee: 0, status: "Completed", party: "Alex Chen", partySub: "@achen", route: "Internal", risk: "Low" },
    { ref: "TXN-2026-00853", date: d("2026-06-09T10:02:00"), kind: "ach", title: "Wells Fargo account", sub: "Ending ****4521", currency: "USD", amount: -1000, fee: 5, status: "Completed", party: "Wells Fargo", partySub: "****4521", route: "ACH", risk: "Low" },
    { ref: "TXN-2026-00854", date: d("2026-06-08T09:00:00"), kind: "receive", title: "Vault Payroll", sub: "Platform automated payout", currency: "USD", amount: 750, fee: 0, status: "Completed", party: "Vault Payroll", partySub: "Automated", route: "Internal", risk: "Low" },
    { ref: "TXN-2026-00855", date: d("2026-06-07T17:28:00"), kind: "wire", title: "Lagos Vault Corp", sub: "Corporate node transfer", currency: "USD", amount: -3000, fee: 25, status: "Failed", party: "Lagos Vault Corp", partySub: "Corporate node", route: "SWIFT Wire", risk: "High", flagged: true },
    { ref: "TXN-2026-00856", date: d("2026-06-06T12:11:00"), kind: "convert", title: "EUR → GBP conversion", sub: "Direct FX pricing", currency: "GBP", amount: 430, fee: 1, status: "Completed", party: "FX Desk", partySub: "EUR → GBP", route: "FX Swap", risk: "Low" },
  ];
  for (const t of txns) await prisma.transaction.create({ data: { ...t, ownerId: sarah.id } });

  // -------------------------------------------------------------------------
  // Sarah's recipients
  // -------------------------------------------------------------------------
  await prisma.recipient.createMany({
    data: [
      { ownerId: sarah.id, type: "USER", name: "John Doe", handle: "@john_doe", avatar: "/avatars/john.png", favorite: true, lastSent: d("2026-06-15") },
      { ownerId: sarah.id, type: "USER", name: "Maria Santos", handle: "@maria_s", avatar: "/avatars/maria.png", lastSent: d("2026-06-02") },
      { ownerId: sarah.id, type: "USER", name: "Alex Chen", handle: "@achen", avatar: "/avatars/alex.png", favorite: true, lastSent: d("2026-05-28") },
      { ownerId: sarah.id, type: "USER", name: "Priya Patel", handle: "@priya_p", avatar: "/avatars/priya.png", lastSent: d("2026-05-15") },
      { ownerId: sarah.id, type: "USER", name: "Omar Hassan", handle: "@omar_h", avatar: "/avatars/omar.png", lastSent: d("2026-04-30") },
      { ownerId: sarah.id, type: "USER", name: "Lisa Park", handle: "@lisapark", avatar: "/avatars/lisa.png", lastSent: d("2026-04-12") },
      { ownerId: sarah.id, type: "BANK", name: "Maria Santos", flag: "🇧🇷", bankName: "Banco do Brasil", accountMask: "****4521", lastSent: d("2026-06-12") },
    ],
  });

  // -------------------------------------------------------------------------
  // Sarah's card + recent authorizations
  // -------------------------------------------------------------------------
  const card = await prisma.card.create({
    data: { ownerId: sarah.id, name: "Vault Premium", brand: "AMEX", last4: "1005", holder: "Sarah Jenkins", expiry: "12/30", spent: 1120.4, limit: 10000 },
  });
  await prisma.cardAuthorization.createMany({
    data: [
      { cardId: card.id, merchant: "Github Enterprise", category: "Developer Tools", when: "Today, 10:15 AM", amount: -19, sort: 0 },
      { cardId: card.id, merchant: "Apple App Store", category: "Entertainment", when: "Yesterday, 04:15 PM", amount: -4.99, sort: 1 },
      { cardId: card.id, merchant: "Starbucks Coffee", category: "Food & Beverage", when: "Yesterday, 09:42 AM", amount: -6.8, sort: 2 },
      { cardId: card.id, merchant: "Herman Miller Inc", category: "Furniture & Decor", when: "June 08, 2026", amount: -1299, sort: 3 },
    ],
  });

  // -------------------------------------------------------------------------
  // Sarah's linked devices
  // -------------------------------------------------------------------------
  await prisma.device.createMany({
    data: [
      { ownerId: sarah.id, kind: "laptop", name: 'MacBook Pro 14"', meta: "San Francisco • Active Now", current: true, sort: 0 },
      { ownerId: sarah.id, kind: "phone", name: "iPhone 15 Pro", meta: "San Francisco • 2 Hours Ago", sort: 1 },
      { ownerId: sarah.id, kind: "tablet", name: "iPad Air", meta: "New York • 3 Days Ago", sort: 2 },
    ],
  });

  // -------------------------------------------------------------------------
  // FX rates — display pairs + USD conversion rates used for the portfolio total
  // -------------------------------------------------------------------------
  await prisma.fxRate.createMany({
    data: [
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
    ],
  });

  // -------------------------------------------------------------------------
  // KYC applications (admin/kyc) with document checklists
  // -------------------------------------------------------------------------
  const kycSeed = [
    { name: "Maria Santos", requesting: "Tier 2 → 3", docs: "3 documents", submitted: "2 hours ago", risk: 24, riskTone: "text-emerald-500", status: "pending", escalated: false },
    { name: "Priya Patel", requesting: "Tier 1 → 2", docs: "2 documents", submitted: "5 hours ago", risk: 41, riskTone: "text-amber-500", status: "pending", escalated: false },
    { name: "Omar Hassan", requesting: "Tier 2 → 3", docs: "4 documents", submitted: "1 day ago", risk: 63, riskTone: "text-amber-500", status: "escalated", escalated: true },
    { name: "Daniel Cruz", requesting: "Tier 1 → 2", docs: "1 document", submitted: "2 days ago", risk: 85, riskTone: "text-red-500", status: "escalated", escalated: true },
    { name: "Lisa Park", requesting: "Tier 2 → 3", docs: "3 documents", submitted: "3 days ago", risk: 19, riskTone: "text-emerald-500", status: "pending", escalated: false },
    { name: "Alex Chen", requesting: "Tier 2 → 3", docs: "3 documents", submitted: "4 days ago", risk: 15, riskTone: "text-emerald-500", status: "pending", escalated: false },
  ];
  for (const k of kycSeed) {
    const app = await prisma.kycApplication.create({
      data: {
        userId: users[k.name].id, requesting: k.requesting, docs: k.docs,
        submitted: k.submitted, risk: k.risk, riskTone: k.riskTone, status: k.status, escalated: k.escalated,
      },
    });
    await prisma.kycDocument.createMany({
      data: [
        { appId: app.id, label: "Government ID", status: "Verified", sort: 0 },
        { appId: app.id, label: "Proof of Address", status: "Verified", sort: 1 },
        { appId: app.id, label: "Biometric Liveness", status: k.risk > 50 ? "Pending" : "Verified", sort: 2 },
        { appId: app.id, label: "Sanctions Screening", status: "Cleared", sort: 3 },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Transfers awaiting authorization (admin/transfers)
  // -------------------------------------------------------------------------
  await prisma.transfer.createMany({
    data: [
      { ref: "TRF-2026-0472", party: "Lagos Vault Corp", partySub: "Corporate node transfer", route: "SWIFT Wire", amount: 15000, status: "Pending", risk: "High", submitted: "12 min ago" },
      { ref: "TRF-2026-0473", party: "Maria Santos", partySub: "Banco do Brasil", route: "SWIFT Wire", amount: 2500, status: "Pending", risk: "Medium", submitted: "44 min ago" },
      { ref: "TRF-2026-0474", party: "Chase Bank", partySub: "ACH settlement", route: "ACH", amount: 5000, status: "Pending", risk: "Low", submitted: "1 hour ago" },
      { ref: "TRF-2026-0475", party: "Alex Chen", partySub: "Internal transfer", route: "Internal", amount: 300, status: "Authorized", risk: "Low", submitted: "2 hours ago" },
      { ref: "TRF-2026-0476", party: "Priya Patel", partySub: "FX settlement", route: "FX Swap", amount: 1200, status: "Pending", risk: "Medium", submitted: "3 hours ago" },
      { ref: "TRF-2026-0477", party: "Omar Hassan", partySub: "Wire out", route: "SWIFT Wire", amount: 9800, status: "Rejected", risk: "High", submitted: "5 hours ago" },
      { ref: "TRF-2026-0478", party: "Wells Fargo", partySub: "ACH debit", route: "ACH", amount: 1000, status: "Authorized", risk: "Low", submitted: "6 hours ago" },
    ],
  });

  // -------------------------------------------------------------------------
  // Risk flags + detection rules (admin/risk)
  // -------------------------------------------------------------------------
  await prisma.riskFlag.createMany({
    data: [
      { account: "User #4821", accountSub: "Unknown recipient", trigger: "Velocity + new payee", score: 92, amount: 15000, when: "12 min ago", critical: true },
      { account: "User #1120", accountSub: "Lagos Vault Corp", trigger: "Sanctions match (weak)", score: 88, amount: 9800, when: "1 hour ago" },
      { account: "User #2847", accountSub: "Daniel Cruz", trigger: "Daily limit breach", score: 85, amount: 12500, when: "3 hours ago" },
      { account: "User #7392", accountSub: "Omar Hassan", trigger: "Geo-anomaly login", score: 78, amount: 2500, when: "4 hours ago" },
      { account: "User #5567", accountSub: "Priya Patel", trigger: "Device fingerprint mismatch", score: 66, amount: 1200, when: "6 hours ago" },
    ],
  });
  await prisma.detectionRule.createMany({
    data: [
      { label: "Velocity monitoring", desc: "Rapid successive transfers", enabled: true, sort: 0 },
      { label: "Geo-anomaly detection", desc: "Impossible-travel logins", enabled: true, sort: 1 },
      { label: "Sanctions / PEP screening", desc: "OFAC & watchlist match", enabled: true, sort: 2 },
      { label: "Device fingerprinting", desc: "New / spoofed devices", enabled: true, sort: 3 },
      { label: "Auto-freeze on score > 90", desc: "Suspend without review", enabled: false, sort: 4 },
    ],
  });

  // -------------------------------------------------------------------------
  // Fees & limits (admin/fees)
  // -------------------------------------------------------------------------
  await prisma.fee.createMany({
    data: [
      { name: "Internal Transfer", category: "Platform", detail: "Vault-to-Vault instant", amount: "$0.00", tier: "All tiers", sort: 0 },
      { name: "ACH Transfer", category: "Domestic", detail: "1–3 business days", amount: "$5.00", tier: "All tiers", sort: 1 },
      { name: "SWIFT Wire", category: "International", detail: "Cross-border settlement", amount: "$15.00", tier: "Tier 1–2", sort: 2 },
      { name: "SWIFT Wire", category: "International", detail: "Cross-border settlement", amount: "$8.00", tier: "Tier 3", sort: 3 },
      { name: "FX Conversion", category: "Exchange", detail: "Spread over mid-market", amount: "0.25%", tier: "All tiers", sort: 4 },
      { name: "Card Issuance", category: "Cards", detail: "Physical card, one-time", amount: "$9.99", tier: "All tiers", sort: 5 },
      { name: "Instant Payout", category: "Cards", detail: "Push-to-card acceleration", amount: "1.50%", tier: "All tiers", sort: 6 },
      { name: "Account Maintenance", category: "Platform", detail: "Monthly, waived over $10k", amount: "$0.00", tier: "Tier 3", sort: 7 },
    ],
  });

  // -------------------------------------------------------------------------
  // Admin overview widgets
  // -------------------------------------------------------------------------
  await prisma.gateway.createMany({
    data: [
      { name: "SWIFT Network", status: "Operational", tone: "text-emerald-500", sort: 0 },
      { name: "USD Settlement", status: "Healthy", tone: "text-emerald-500", sort: 1 },
      { name: "KYC Synapse", status: "Degraded", tone: "text-amber-500", sort: 2 },
      { name: "Ledger Core", status: "Operational", tone: "text-emerald-500", sort: 3 },
    ],
  });
  await prisma.alert.createMany({
    data: [
      { severity: "critical", title: "High-risk transfer flagged", detail: "User #4821 — velocity + new payee", when: "12 min ago", sort: 0 },
      { severity: "medium", title: "Sanctions weak match", detail: "Lagos Vault Corp settlement held", when: "1 hour ago", sort: 1 },
      { severity: "warning", title: "KYC Synapse degraded", detail: "Verification latency above SLA", when: "2 hours ago", sort: 2 },
      { severity: "notice", title: "Daily volume milestone", detail: "Platform crossed $2M settled", when: "4 hours ago", sort: 3 },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

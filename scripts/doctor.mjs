// Health check for the Profintal Savings database.
//
//   npm run db:doctor
//
// Run this any time something looks wrong, or after a round of testing. It
// checks the invariants that, when broken, produce confusing runtime errors —
// the duplicate-ref failure being the obvious example.
//
// Read-only: it never writes anything.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") globalThis.WebSocket = ws;

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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(URL, KEY, { auth: { persistSession: false } });

let failures = 0;
let warnings = 0;

function report(ok, label, detail, { warn = false } = {}) {
  const tag = ok ? "  ok  " : warn ? " warn " : " FAIL ";
  console.log(`${tag} ${label}${detail ? `  — ${detail}` : ""}`);
  if (!ok) warn ? warnings++ : failures++;
}

async function main() {
  console.log("\nProfintal Savings — database health check\n");

  // --- ledger references --------------------------------------------------
  const { data: txns } = await db.from("transactions").select("ref");
  const refs = (txns ?? []).map((t) => t.ref);
  report(
    new Set(refs).size === refs.length,
    "transaction refs unique",
    `${refs.length} rows`,
  );

  // The generator must always be ahead of the highest ref in the table.
  const { data: probe, error: probeErr } = await db.rpc("next_txn_ref");
  if (probeErr) {
    report(false, "next_txn_ref() callable", probeErr.message);
  } else {
    const nextNum = Number(String(probe).replace(/^.*-/, ""));
    const maxNum = refs.length
      ? Math.max(...refs.map((r) => Number(String(r).replace(/^.*-/, ""))))
      : 0;
    report(
      nextNum > maxNum,
      "ref generator ahead of history",
      `next=${probe}, highest stored=${maxNum || "none"}`,
    );
    report(!refs.includes(probe), "next ref not already taken", String(probe));
  }

  // --- wallets ------------------------------------------------------------
  const { data: wallets } = await db
    .from("wallets")
    .select("id,ownerId,currency,balance,available,primary,accountNumber");
  const w = wallets ?? [];

  const byOwnerCur = new Map();
  for (const x of w) {
    const k = `${x.ownerId}:${x.currency}`;
    byOwnerCur.set(k, (byOwnerCur.get(k) ?? 0) + 1);
  }
  const dupWallets = [...byOwnerCur.values()].filter((n) => n > 1).length;
  report(dupWallets === 0, "one wallet per owner per currency", `${w.length} wallets`);

  const accts = w.map((x) => x.accountNumber).filter(Boolean);
  report(
    new Set(accts).size === accts.length,
    "account numbers unique",
    `${accts.length} assigned`,
  );

  const negative = w.filter((x) => Number(x.balance) < 0);
  report(
    negative.length === 0,
    "no negative balances",
    negative.length ? negative.map((x) => x.currency).join(", ") : "",
  );

  const mismatched = w.filter(
    (x) => x.available !== null && Number(x.available) > Number(x.balance),
  );
  report(
    mismatched.length === 0,
    "available never exceeds balance",
    mismatched.length ? `${mismatched.length} wallet(s)` : "",
  );

  // --- accounts -----------------------------------------------------------
  const { data: profiles } = await db
    .from("profiles")
    .select("id,email,role,username");
  const p = profiles ?? [];
  const customers = p.filter((x) => x.role === "CUSTOMER");
  const admins = p.filter((x) => x.role === "ADMIN");
  report(admins.length >= 1, "an admin account exists", `${admins.length} admin(s)`);

  const usernames = p.map((x) => x.username).filter(Boolean).map((u) => u.toLowerCase());
  report(
    new Set(usernames).size === usernames.length,
    "usernames unique (case-insensitive)",
    `${usernames.length} set`,
  );

  // Every customer needs wallets, or their dashboard renders empty.
  const ownersWithWallets = new Set(w.map((x) => x.ownerId));
  const walletless = customers.filter((c) => !ownersWithWallets.has(c.id));
  report(
    walletless.length === 0,
    "every customer has wallets",
    walletless.length ? walletless.map((c) => c.email).join(", ") : `${customers.length} customer(s)`,
  );

  // An auth user with no profile row loops between /dashboard and /login.
  const authUsers = [];
  for (let page = 1; page <= 10; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const batch = data?.users ?? [];
    authUsers.push(...batch);
    if (batch.length < 200) break;
  }
  const profileIds = new Set(p.map((x) => x.id));
  const orphans = authUsers.filter((u) => !profileIds.has(u.id));
  // Recoverable: login() provisions a missing profile rather than looping.
  // Still worth surfacing, because the recovered account has no sign-up
  // details and will look half-empty.
  report(
    orphans.length === 0,
    "no auth users without a profile",
    orphans.length
      ? `${orphans.map((u) => u.email).join(", ")} — they can still sign in ` +
        `(login re-provisions), but with no details. Clear with: ` +
        `npm run db:reset-test -- --yes`
      : `${authUsers.length} auth user(s)`,
    { warn: true },
  );

  // --- reference data -----------------------------------------------------
  for (const [table, min] of [
    ["fx_rates", 4],
    ["fees", 1],
    ["gateways", 1],
    ["detection_rules", 1],
  ]) {
    const { count } = await db
      .from(table)
      .select("*", { count: "exact", head: true });
    report((count ?? 0) >= min, `${table} populated`, `${count ?? 0} rows`);
  }

  // --- KYC ----------------------------------------------------------------
  const { data: apps } = await db
    .from("kyc_applications")
    .select("id,status,submittedAt");
  const bad = (apps ?? []).filter(
    (a) => a.status === "pending" && !a.submittedAt,
  );
  report(
    bad.length === 0,
    "no pending KYC without a submission",
    bad.length ? `${bad.length} stuck in the queue` : `${(apps ?? []).length} application(s)`,
  );

  const { data: buckets } = await db.storage.listBuckets();
  const kyc = (buckets ?? []).find((b) => b.name === "kyc-documents");
  report(!!kyc, "kyc-documents bucket exists");
  if (kyc) report(kyc.public === false, "kyc-documents bucket is private");

  // --- summary ------------------------------------------------------------
  console.log(
    `\n${failures === 0 ? "All checks passed" : `${failures} check(s) FAILED`}` +
      `${warnings ? `, ${warnings} warning(s)` : ""}.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("\ndoctor crashed:", e.message);
  process.exit(1);
});

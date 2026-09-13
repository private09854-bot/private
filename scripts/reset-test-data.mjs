// Clear test activity without breaking anything.
//
//   npm run db:reset-test            preview what would be removed
//   npm run db:reset-test -- --yes   actually remove it
//   npm run db:reset-test -- --yes --keep-users
//
// Removes customer accounts and their activity, then puts the treasury back to
// its opening balance. The admin account, FX rates, fees, gateways and
// detection rules are always left alone.
//
// Why use this instead of deleting rows by hand: ledger references come from a
// sequence, and sequences are deliberately NOT rewound here. Reusing a ref is
// what caused "duplicate key value violates unique constraint
// transactions_ref_key" — refs must only ever move forward.
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

const args = process.argv.slice(2);
const CONFIRMED = args.includes("--yes");
const KEEP_USERS = args.includes("--keep-users");

const TREASURY = { USD: 1000000, EUR: 500000, GBP: 400000, CAD: 600000 };
const money = (n) =>
  Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

async function main() {
  const { data: admin } = await db
    .from("profiles")
    .select("id,email")
    .eq("role", "ADMIN")
    .maybeSingle();
  if (!admin) {
    console.error("No admin account found — run `npm run db:seed` first.");
    process.exit(1);
  }

  const { data: customers } = await db
    .from("profiles")
    .select("id,email,name")
    .eq("role", "CUSTOMER");
  const cust = customers ?? [];

  const { count: txnCount } = await db
    .from("transactions")
    .select("*", { count: "exact", head: true });
  const { count: kycCount } = await db
    .from("kyc_applications")
    .select("*", { count: "exact", head: true });

  console.log("\nThis will remove:");
  console.log(`  transactions        ${txnCount ?? 0}`);
  console.log(`  KYC applications    ${kycCount ?? 0}`);
  console.log(`  support messages    (all)`);
  if (!KEEP_USERS) {
    console.log(`  customer accounts   ${cust.length}`);
    for (const c of cust) console.log(`                      - ${c.email} (${c.name})`);
  } else {
    console.log(`  customer accounts   kept (--keep-users), wallets zeroed`);
  }
  console.log("\nAnd restore the treasury to:");
  for (const [cur, amt] of Object.entries(TREASURY)) {
    console.log(`  ${cur}  ${money(amt)}`);
  }
  console.log(`\nKept: admin (${admin.email}), FX rates, fees, gateways, detection rules.`);
  console.log("Ledger refs keep moving forward — the sequence is never rewound.");

  if (!CONFIRMED) {
    console.log("\nPreview only. Re-run with --yes to apply.\n");
    return;
  }

  console.log("\nApplying…");

  // Activity first. Deleting a profile cascades to its child rows, but
  // clearing explicitly keeps this correct when --keep-users is set.
  await db.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("support_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("kyc_documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("kyc_applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("transfers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("risk_flags").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("alerts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("  cleared activity tables");

  if (!KEEP_USERS) {
    for (const c of cust) {
      // Uploaded KYC files are namespaced by user id.
      const { data: files } = await db.storage.from("kyc-documents").list(c.id);
      if (files?.length) {
        await db.storage
          .from("kyc-documents")
          .remove(files.map((f) => `${c.id}/${f.name}`));
      }
      await db.from("profiles").delete().eq("id", c.id); // cascades
      await db.auth.admin.deleteUser(c.id).catch(() => {});
    }
    console.log(`  removed ${cust.length} customer account(s) and their uploads`);

    // Sweep auth users left without a profile — otherwise they can still sign
    // in and get a fresh, detail-less account provisioned for them.
    const { data: keep } = await db.from("profiles").select("id");
    const keepIds = new Set((keep ?? []).map((x) => x.id));
    const stray = [];
    for (let page = 1; page <= 10; page++) {
      const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
      const batch = data?.users ?? [];
      stray.push(...batch.filter((u) => !keepIds.has(u.id)));
      if (batch.length < 200) break;
    }
    for (const u of stray) await db.auth.admin.deleteUser(u.id).catch(() => {});
    if (stray.length) {
      console.log(`  removed ${stray.length} orphaned auth user(s): ${stray.map((u) => u.email).join(", ")}`);
    }
  } else {
    for (const c of cust) {
      await db
        .from("wallets")
        .update({ balance: 0, available: 0, pending: 0 })
        .eq("ownerId", c.id);
    }
    console.log(`  zeroed wallets for ${cust.length} customer(s)`);
  }

  for (const [currency, amount] of Object.entries(TREASURY)) {
    await db
      .from("wallets")
      .update({ balance: amount, available: amount, pending: 0 })
      .eq("ownerId", admin.id)
      .eq("currency", currency);
  }
  console.log("  treasury restored");

  console.log("\nDone. Run `npm run db:doctor` to confirm everything is healthy.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

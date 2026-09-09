"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

export type AuthState = { error?: string };

function setSession(userId: string) {
  cookies().set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------
export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return { error: "Invalid email or password." };
  }

  setSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Sign up — provisions a fresh customer account and signs them in
// ---------------------------------------------------------------------------
function randomAccountNumber(): string {
  const digits = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
}

const AVATAR_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5e9"];

function initialsAvatar(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials =
    (parts[0]?.[0] ?? "U") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  const color =
    AVATAR_COLORS[name.length % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' rx='48' fill='${color}'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='sans-serif' font-weight='700' font-size='38' fill='white'>${initials.toUpperCase()}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const NEW_WALLETS = [
  { currency: "USD", symbol: "$", changeLabel: "+0.00%", changeTone: "flat", sort: 0, primary: true },
  { currency: "EUR", symbol: "€", changeLabel: "+0.00%", changeTone: "flat", sort: 1, primary: false },
  { currency: "GBP", symbol: "£", changeLabel: "+0.00%", changeTone: "flat", sort: 2, primary: false },
  { currency: "NGN", symbol: "₦", changeLabel: "Stable", changeTone: "flat", sort: 3, primary: false },
  { currency: "CAD", symbol: "$", changeLabel: "+0.00%", changeTone: "flat", sort: 4, primary: false },
];

const WELCOME_BONUS = 250;

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name || !email || !password) {
    return { error: "Fill in your name, email and password." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (confirm && confirm !== password) {
    return { error: "Passwords do not match." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        password,
        role: "CUSTOMER",
        name,
        handle: `@${name.toLowerCase().replace(/\s+/g, "_")}`,
        avatar: initialsAvatar(name),
        title: "Account Holder",
        country: "🇺🇸",
        tier: "Tier 1",
        kycStatus: "Verified",
        riskScore: 10,
      },
    });

    for (const w of NEW_WALLETS) {
      await tx.wallet.create({
        data: {
          ownerId: created.id,
          currency: w.currency,
          symbol: w.symbol,
          balance: w.primary ? WELCOME_BONUS : 0,
          available: w.primary ? WELCOME_BONUS : 0,
          pending: 0,
          changeLabel: w.changeLabel,
          changeTone: w.changeTone,
          primary: w.primary,
          sort: w.sort,
          ...(w.primary
            ? {
                accountHolder: name,
                accountNumber: randomAccountNumber(),
                achRouting: "021000021",
                wireRouting: "026009593",
                bankName: "Vault Financial, Inc.",
                bankAddress: "1 Market Street, San Francisco, CA 94105",
                swift: "VLTFUS33",
              }
            : {}),
        },
      });
    }

    await tx.userSettings.create({ data: { ownerId: created.id } });

    const count = await tx.transaction.count();
    await tx.transaction.create({
      data: {
        ref: `TXN-2026-${String(847 + count).padStart(5, "0")}`,
        ownerId: created.id,
        date: new Date(),
        kind: "receive",
        title: "Vault Welcome Bonus",
        sub: "Platform sign-up credit",
        currency: "USD",
        amount: WELCOME_BONUS,
        fee: 0,
        status: "Completed",
        party: "Vault",
        partySub: "Welcome credit",
        route: "Internal",
        risk: "Low",
      },
    });

    return created;
  });

  setSession(user.id);
  redirect("/dashboard");
}

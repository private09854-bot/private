"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type AuthState = { error?: string };

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

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile?.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logout() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Sign up — creates the auth user, then provisions their account
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
  { currency: "CAD", symbol: "$", changeLabel: "+0.00%", changeTone: "flat", sort: 3, primary: false },
];

/** Create the profile, wallets and settings for a new user. */
export async function provisionAccount(
  userId: string,
  email: string,
  name: string,
  role: "CUSTOMER" | "ADMIN" = "CUSTOMER",
) {
  await supabaseAdmin.from("profiles").insert({
    id: userId,
    email,
    role,
    name,
    handle: `@${name.toLowerCase().replace(/\s+/g, "_")}`,
    avatar: initialsAvatar(name),
    title: role === "ADMIN" ? "System Overseer" : "Account Holder",
    country: "🇺🇸",
    tier: role === "ADMIN" ? "Tier 3" : "Tier 1",
    kycStatus: "Verified",
    riskScore: 10,
  });

  await supabaseAdmin.from("wallets").insert(
    NEW_WALLETS.map((w) => ({
      ownerId: userId,
      currency: w.currency,
      symbol: w.symbol,
      balance: 0,
      available: 0,
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
            bankName: "Profintal Savings, Inc.",
            bankAddress: "1 Market Street, San Francisco, CA 94105",
            swift: "PFSVUS33",
          }
        : {}),
    })),
  );

  await supabaseAdmin.from("user_settings").insert({ ownerId: userId });
}

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

  // Create the user already confirmed so they can sign in immediately,
  // regardless of the project's email-confirmation setting.
  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

  if (createError || !created.user) {
    const msg = createError?.message ?? "Could not create your account.";
    if (/already|registered|exists/i.test(msg)) {
      return { error: "An account with that email already exists." };
    }
    return { error: msg };
  }

  await provisionAccount(created.user.id, email, name, "CUSTOMER");

  const supabase = createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    return { error: "Account created — please sign in." };
  }

  redirect("/dashboard");
}

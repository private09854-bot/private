import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type Profile = {
  id: string;
  email: string;
  role: string; // "CUSTOMER" | "ADMIN"
  name: string;
  handle: string | null;
  avatar: string | null;
  title: string | null;
  country: string | null;
  tier: string | null;
  kycStatus: string | null;
  riskScore: number | null;
  flagged: boolean;
  joined: string;
  createdAt: string;
};

/** The signed-in user's profile row, or null when signed out. */
export async function getSessionUser(): Promise<Profile | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}

/** Require any authenticated user; redirect to /login otherwise. */
export async function requireUser(): Promise<Profile> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Require an ADMIN; bounce customers to their dashboard. */
export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

/** Require a CUSTOMER; bounce admins into the admin console. */
export async function requireCustomer(): Promise<Profile> {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  return user;
}

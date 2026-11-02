"use server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/session";
import { resolveLocale } from "@/lib/i18n/config";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function updateLocalePreference(locale: string) { const user = await getSessionUser(); if (!user) return { ok: true }; const { error } = await supabaseAdmin.from("profiles").update({ preferredLanguage: resolveLocale(locale) }).eq("id", user.id); if (error) return { error: error.message }; revalidatePath("/"); return { ok: true }; }

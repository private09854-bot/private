import { NextRequest, NextResponse } from "next/server";
import { resolveLocale } from "@/lib/i18n/config";
import { translationResource } from "@/lib/i18n/server";
export const runtime = "nodejs";
const requests = new Map<string, { count: number; resetAt: number }>();
function allowed(request: NextRequest) { const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"; const now = Date.now(); const value = requests.get(ip); if (!value || value.resetAt < now) { requests.set(ip, { count: 1, resetAt: now + 60_000 }); return true; } value.count += 1; return value.count <= 20; }
export async function GET(request: NextRequest, { params }: { params: { locale: string } }) {
  if (!allowed(request)) return NextResponse.json({ error: "Too many translation requests." }, { status: 429 });
  try { const resource = await translationResource(resolveLocale(params.locale)); return NextResponse.json(resource, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }); }
  catch (error) { console.error("[i18n] translation request failed", error); return NextResponse.json({ error: "Translations are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}

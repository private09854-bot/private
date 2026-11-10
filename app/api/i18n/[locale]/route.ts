import { NextResponse } from "next/server";
import { translationResource } from "@/lib/i18n/server";

export async function GET(_request: Request, { params }: { params: { locale: string } }) {
  try {
    const resource = await translationResource(params.locale);
    return NextResponse.json(resource, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("[i18n] translation request failed", error);
    return NextResponse.json({ error: "Translations are temporarily unavailable." }, { status: 503 });
  }
}

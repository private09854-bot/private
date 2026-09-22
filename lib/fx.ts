import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Live foreign-exchange rates.
 *
 * Rates come from the European Central Bank via frankfurter.app (free, no API
 * key). We fetch USD-based rates plus the previous trading day so the daily
 * change is real, not a hardcoded string. Results are cached for an hour (ECB
 * publishes at most once a day), and if the network is unreachable we fall back
 * to the `fx_rates` table so nothing on the page ever breaks.
 */

export const FX_CURRENCIES = ["USD", "EUR", "GBP", "CAD"] as const;
const QUOTES = ["EUR", "GBP", "CAD"]; // relative to USD

/** currency -> how many of it one USD buys (USD is always 1). */
type UsdMap = Record<string, number>;

export type FxSnapshot = {
  today: UsdMap;
  prev: UsdMap;
  date: string;
  source: "live" | "fallback";
};

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchFrankfurter(): Promise<FxSnapshot | null> {
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 8 * 86_400_000); // cover weekends/holidays
    const url =
      `https://api.frankfurter.app/${fmtDate(start)}..${fmtDate(end)}` +
      `?from=USD&to=${QUOTES.join(",")}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      rates?: Record<string, Record<string, number>>;
    };
    const byDate = json.rates ?? {};
    const dates = Object.keys(byDate).sort();
    if (dates.length === 0) return null;

    const last = dates[dates.length - 1];
    const prev = dates[dates.length - 2] ?? last;
    const toMap = (r: Record<string, number>): UsdMap => ({ USD: 1, ...r });

    return {
      today: toMap(byDate[last]),
      prev: toMap(byDate[prev]),
      date: last,
      source: "live",
    };
  } catch {
    return null; // offline / DNS / timeout — caller falls back
  }
}

/** Build a USD map from the seeded fx_rates table (used only when live fails). */
async function tableFallback(): Promise<FxSnapshot> {
  const { data } = await supabaseAdmin
    .from("fx_rates")
    .select("base,quote,rate")
    .eq("base", "USD");

  const today: UsdMap = { USD: 1 };
  for (const r of data ?? []) today[r.quote as string] = r.rate as number;
  // Sensible defaults if the table is empty too.
  for (const q of QUOTES) if (today[q] == null) today[q] = 1;

  return { today, prev: today, date: fmtDate(new Date()), source: "fallback" };
}

let cached: { at: number; snap: FxSnapshot } | null = null;

/** Current FX snapshot (live where possible), memoised per server instance. */
export async function getFxSnapshot(): Promise<FxSnapshot> {
  // Short in-process memo so one request doesn't fetch repeatedly; the real
  // caching lives in the fetch() call above.
  if (cached && Date.now() - cached.at < 60_000) return cached.snap;
  const snap = (await fetchFrankfurter()) ?? (await tableFallback());
  cached = { at: Date.now(), snap };
  return snap;
}

/** Cross rate base -> quote from a USD map. */
export function crossRate(map: UsdMap, base: string, quote: string): number {
  if (base === quote) return 1;
  const b = map[base];
  const q = map[quote];
  if (!b || !q) return 0;
  return q / b;
}

/** Percentage change of a pair between two snapshots. */
export function pairChangePct(
  snap: FxSnapshot,
  base: string,
  quote: string,
): number {
  const now = crossRate(snap.today, base, quote);
  const before = crossRate(snap.prev, base, quote);
  if (!before) return 0;
  return ((now - before) / before) * 100;
}

export function formatChange(pct: number): {
  label: string;
  tone: "up" | "down" | "flat";
} {
  const rounded = Math.round(pct * 100) / 100;
  const tone = rounded > 0.005 ? "up" : rounded < -0.005 ? "down" : "flat";
  const sign = rounded > 0 ? "+" : "";
  return { label: `${sign}${rounded.toFixed(2)}%`, tone };
}

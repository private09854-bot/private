import { supabaseAdmin } from "@/lib/supabase/admin";

/** Map of currency -> its value in USD (for portfolio totals). */
export async function usdRateMap(): Promise<Map<string, number>> {
  const { data } = await supabaseAdmin
    .from("fx_rates")
    .select("base,rate")
    .eq("quote", "USD");

  const map = new Map<string, number>(
    (data ?? []).map((r) => [r.base as string, r.rate as number]),
  );
  map.set("USD", 1);
  return map;
}

/** Look up a single directional FX rate (base -> quote). */
export async function getFxRate(
  base: string,
  quote: string,
): Promise<number | null> {
  if (base === quote) return 1;
  const { data } = await supabaseAdmin
    .from("fx_rates")
    .select("rate")
    .eq("base", base)
    .eq("quote", quote)
    .maybeSingle();
  return (data?.rate as number | undefined) ?? null;
}

/** Total portfolio value in USD across a set of wallets. */
export function portfolioUsd(
  wallets: { currency: string; balance: number }[],
  rates: Map<string, number>,
): number {
  return wallets.reduce(
    (sum, w) => sum + w.balance * (rates.get(w.currency) ?? 0),
    0,
  );
}

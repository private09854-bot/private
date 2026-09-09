import { prisma } from "@/lib/db";

/** Map of currency -> its value in USD (for portfolio totals). */
export async function usdRateMap(): Promise<Map<string, number>> {
  const rows = await prisma.fxRate.findMany({ where: { quote: "USD" } });
  const map = new Map(rows.map((r) => [r.base, r.rate]));
  map.set("USD", 1);
  return map;
}

/** Look up a single directional FX rate (base -> quote). */
export async function getFxRate(
  base: string,
  quote: string,
): Promise<number | null> {
  if (base === quote) return 1;
  const row = await prisma.fxRate.findUnique({
    where: { base_quote: { base, quote } },
  });
  return row?.rate ?? null;
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

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

export type WithdrawalNotice = { title: string; body: string };

const DEFAULT_WITHDRAWAL_NOTICE: WithdrawalNotice = {
  title: "Withdrawals unavailable",
  body: "We are pleased to inform you that your funds are now fully available for use. However, please be advised that access to your account via {method} is temporarily restricted. Should you require any further clarification, please contact our customer support team.",
};

/**
 * The withdrawal-blocked message shown to customers. Editable by the admin from
 * the settings page, so the copy lives in the database rather than in code.
 * `{method}` in the body is replaced with the chosen payout method's name.
 */
export async function getWithdrawalNotice(): Promise<WithdrawalNotice> {
  const { data } = await supabaseAdmin
    .from("platform_settings")
    .select("value")
    .eq("key", "withdrawal_notice")
    .maybeSingle();

  const v = data?.value as Partial<WithdrawalNotice> | undefined;
  return {
    title: v?.title?.trim() || DEFAULT_WITHDRAWAL_NOTICE.title,
    body: v?.body?.trim() || DEFAULT_WITHDRAWAL_NOTICE.body,
  };
}

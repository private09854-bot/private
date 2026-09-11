// Money + number formatting. All amounts are stored numerically in the
// database; the UI renders them through these helpers so display stays
// consistent with the original design strings (e.g. "-$500.00", "€1,200.00").

export const CURRENCIES: Record<string, { symbol: string; decimals: number }> = {
  USD: { symbol: "$", decimals: 2 },
  EUR: { symbol: "€", decimals: 2 },
  GBP: { symbol: "£", decimals: 2 },
  CAD: { symbol: "$", decimals: 2 },
};

export function currencySymbol(currency: string): string {
  return CURRENCIES[currency]?.symbol ?? "$";
}

export const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  CAD: "🇨🇦",
};

export function currencyFlag(currency: string): string {
  return CURRENCY_FLAGS[currency] ?? "🏳️";
}

/**
 * Format an amount for a given currency.
 * - `sign: true` prefixes "+" for positives and "-" for negatives (ledger view).
 * - Otherwise only negatives get a "-" and positives are bare (balances/fees).
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  opts: { sign?: boolean } = {},
): string {
  const cfg = CURRENCIES[currency] ?? { symbol: "$", decimals: 2 };
  const abs = Math.abs(amount);
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  }).format(abs);
  let prefix = "";
  if (opts.sign) prefix = amount < 0 ? "-" : amount > 0 ? "+" : "";
  else if (amount < 0) prefix = "-";
  return `${prefix}${cfg.symbol}${num}`;
}

/** Plain grouped number, no currency symbol. */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Compact money for KPI tiles, e.g. 2410000 -> "$2.41M". */
export function formatCompact(value: number, currency = "USD"): string {
  const sym = currencySymbol(currency);
  if (Math.abs(value) >= 1_000_000)
    return `${sym}${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${sym}${(value / 1_000).toFixed(1)}K`;
  return `${sym}${formatNumber(value, 2)}`;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format a date as "Jun 15, 2026". Accepts a Date or an ISO string. */
export function formatDate(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return `${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
}

/**
 * "Just now", "12 min ago", "3 hours ago", "2 days ago".
 * Used wherever the UI shows how long ago something was submitted, so the
 * label stays truthful instead of being frozen at write time.
 */
export function relativeTime(input: Date | string | null): string {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  const secs = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(date);
}

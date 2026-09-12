import { BRAND_MARKS } from "@/lib/brand-marks";
import type { PaymentMethod } from "@/lib/payment-methods";

/**
 * The tile shown for a payout method: the brand's own logo where one is
 * published openly, a Lucide glyph for generic bank rails, and a lettermark
 * for brands with no open logo.
 */
export default function MethodMark({
  method,
  size = "lg",
}: {
  method: PaymentMethod;
  size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "size-14 rounded-2xl" : "size-10 rounded-xl";
  const glyph = size === "lg" ? "size-7" : "size-5";
  const mark = method.mark ? BRAND_MARKS[method.mark] : null;

  return (
    <span
      className={`flex shrink-0 items-center justify-center border border-black/5 ${box} ${method.tile}`}
    >
      {mark ? (
        <svg
          viewBox="0 0 24 24"
          role="img"
          aria-label={mark.title}
          className={glyph}
          fill={method.fg}
        >
          <path d={mark.path} />
        </svg>
      ) : method.icon ? (
        <method.icon className={glyph} style={{ color: method.fg }} />
      ) : (
        <span
          className={size === "lg" ? "text-xl font-black" : "text-sm font-black"}
          style={{ color: method.fg }}
        >
          {method.letter}
        </span>
      )}
    </span>
  );
}

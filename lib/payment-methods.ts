import { Landmark, ArrowLeftRight, type LucideIcon } from "lucide-react";

export type PaymentMethod = {
  key: string;
  name: string;
  blurb: string;
  /** Tailwind classes for the tile background. */
  tile: string;
  /** Brand colour the mark is drawn in (hex, applied as `fill`). */
  fg: string;
  /** Key into BRAND_MARKS for a real brand logo. */
  mark?: string;
  /** Fallback for generic rails that have no brand. */
  icon?: LucideIcon;
  /** Fallback lettermark for any brand with no published open logo. */
  letter?: string;
};

/**
 * Payout methods shown on the Withdraw screen.
 *
 * Brand marks are rendered in each brand's own colour on the background that
 * brand uses for light surfaces — a few (Western Union yellow, Cash App green)
 * are too light to sit on white, so they get their own tile colour instead.
 *
 * This is a demonstration environment: none of these are wired to a real
 * gateway, and the withdraw flow says so plainly.
 */
export const WITHDRAW_METHODS: PaymentMethod[] = [
  {
    key: "wire",
    name: "Wire Transfer",
    blurb: "SWIFT / international bank wire",
    tile: "bg-slate-100",
    fg: "#334155",
    icon: Landmark,
  },
  {
    key: "local",
    name: "Local Transfer",
    blurb: "Domestic ACH / bank payout",
    tile: "bg-blue-50",
    fg: "#1d4ed8",
    icon: ArrowLeftRight,
  },
  {
    key: "paypal",
    name: "PayPal",
    blurb: "Send to a PayPal balance",
    tile: "bg-[#f5f7fa]",
    fg: "#002991",
    mark: "paypal",
  },
  {
    key: "moneygram",
    name: "MoneyGram",
    blurb: "Cash pickup or bank deposit",
    tile: "bg-[#fdeceb]",
    fg: "#DA291C",
    mark: "moneygram",
  },
  {
    key: "googlepay",
    name: "Google Pay",
    blurb: "Google Pay wallet",
    tile: "bg-[#f5f7fa]",
    fg: "#5F6368",
    mark: "googlepay",
  },
  {
    key: "westernunion",
    name: "Western Union",
    blurb: "Cash pickup worldwide",
    tile: "bg-[#FFDD00]",
    fg: "#000000",
    mark: "westernunion",
  },
  {
    key: "cashapp",
    name: "Cash App",
    blurb: "Send to a $Cashtag",
    tile: "bg-[#e6faf0]",
    fg: "#00C244",
    mark: "cashapp",
  },
  {
    key: "zelle",
    name: "Zelle",
    blurb: "Direct bank-to-bank",
    tile: "bg-[#f3eafc]",
    fg: "#6D1ED4",
    mark: "zelle",
  },
];

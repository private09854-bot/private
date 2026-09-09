import {
  Landmark,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  Globe,
  Send,
  Smartphone,
  Banknote,
  type LucideIcon,
} from "lucide-react";

export type PaymentMethod = {
  key: string;
  name: string;
  blurb: string;
  color: string; // tailwind bg class (icon is rendered white)
  icon: LucideIcon;
};

// Payout / withdrawal methods shown on the Withdraw screen. Brand-colored icon
// tiles (no trademarked logo assets) — this is a demo, so no real gateways.
export const WITHDRAW_METHODS: PaymentMethod[] = [
  { key: "wire", name: "Wire Transfer", blurb: "SWIFT / international bank wire", color: "bg-slate-700", icon: Landmark },
  { key: "local", name: "Local Transfer", blurb: "Domestic ACH / bank payout", color: "bg-blue-600", icon: ArrowLeftRight },
  { key: "paypal", name: "PayPal", blurb: "Send to a PayPal balance", color: "bg-[#0070ba]", icon: Wallet },
  { key: "skrill", name: "Skrill", blurb: "Skrill wallet payout", color: "bg-[#862165]", icon: CreditCard },
  { key: "googlepay", name: "Google Pay", blurb: "Google Pay wallet", color: "bg-[#4285f4]", icon: Smartphone },
  { key: "westernunion", name: "Western Union", blurb: "Cash pickup worldwide", color: "bg-amber-500", icon: Globe },
  { key: "wise", name: "Wise", blurb: "Multi-currency transfer", color: "bg-[#163300]", icon: Send },
  { key: "payoneer", name: "Payoneer", blurb: "Payoneer account payout", color: "bg-[#ff4800]", icon: Banknote },
];

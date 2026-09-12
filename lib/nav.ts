import {
  LayoutDashboard,
  Wallet,
  Send,
  Users,
  ListOrdered,
  CreditCard,
  Settings,
  UserRound,
  FileLock2,
  ArrowUpFromLine,
  ShieldAlert,
  TrendingUp,
  BadgePercent,
  Banknote,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Canonical customer-app navigation, taken from the `dashboard` frame
 * (the most complete sidebar in the design). Shared across every /(app) screen.
 */
export const appNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wallets", href: "/wallets", icon: Wallet },
  { label: "Send", href: "/send", icon: Send },
  { label: "Withdraw", href: "/withdraw", icon: Banknote },
  { label: "Recipients", href: "/recipients", icon: Users },
  { label: "Transactions", href: "/transactions", icon: ListOrdered },
  { label: "Cards", href: "/cards", icon: CreditCard },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings },
];

/**
 * Admin-panel navigation, taken from the `admin-dashboard` frame. Every item
 * routes to a dedicated screen under /admin.
 */
export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Send Funds", href: "/admin/send", icon: Send },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "KYC Pending", href: "/admin/kyc", icon: FileLock2 },
  { label: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { label: "Transfers", href: "/admin/transfers", icon: ArrowUpFromLine },
  { label: "Risk & Fraud", href: "/admin/risk", icon: ShieldAlert },
  { label: "Exchange Rates", href: "/admin/rates", icon: TrendingUp },
  { label: "Fees & Limits", href: "/admin/fees", icon: BadgePercent },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

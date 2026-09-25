"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Wallet, CreditCard, UserRound, LayoutGrid, LogOut } from "lucide-react";
import { appNav } from "@/lib/nav";
import { logout } from "@/app/actions/auth";

/** The four quick-access tabs; the fifth slot is the elevated "More" button. */
const TABS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Wallets", href: "/wallets", icon: Wallet },
  { label: "Cards", href: "/cards", icon: CreditCard },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the "More" sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const onTab = TABS.some((t) => isActive(t.href));

  function tab(t: (typeof TABS)[number]) {
    const active = isActive(t.href);
    const Icon = t.icon;
    return (
      <Link
        key={t.href}
        href={t.href}
        className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
          active ? "text-emerald-600" : "text-slate-400"
        }`}
      >
        <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 2} />
        <span>{t.label}</span>
      </Link>
    );
  }

  return (
    <>
      {/* Bottom tab bar — mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] lg:hidden">
        <div className="relative mx-auto grid max-w-lg grid-cols-5 items-center px-1">
          {tab(TABS[0])}
          {tab(TABS[1])}

          {/* Center spacer — the elevated button sits over it */}
          <span aria-hidden="true" />

          {tab(TABS[2])}
          {tab(TABS[3])}

          {/* Elevated "More" button */}
          <button
            onClick={() => setOpen(true)}
            aria-label="More"
            className={`absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white transition-colors ${
              onTab ? "bg-slate-900" : "bg-emerald-600"
            }`}
          >
            <LayoutGrid className="size-6" />
          </button>
        </div>
      </nav>

      {/* "More" sheet with every destination */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 pb-8 shadow-2xl transition-transform duration-300 ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200" />
          <p className="mb-4 text-[15px] font-bold text-slate-900">All features</p>

          <div className="grid grid-cols-3 gap-3">
            {appNav.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-colors ${
                    active
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex size-11 items-center justify-center rounded-xl ${
                      active
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span
                    className={`text-[11px] font-semibold leading-tight ${
                      active ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>

          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { appNav } from "@/lib/nav";
import { logout } from "@/app/actions/auth";
import BrandLogo from "./brand-logo";

export default function AppSidebar({
  user,
}: {
  user: { name: string; email: string; avatar: string | null };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 lg:hidden">
        <BrandLogo href="/dashboard" compact />
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="text-slate-300 transition-colors hover:text-white"
        >
          <Menu className="size-6" />
        </button>
      </div>

      {/* Drawer overlay (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 px-5 pb-6 pt-8 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-10">
          {/* Logo */}
          <div className="flex items-center justify-between pl-2">
            <BrandLogo href="/dashboard" compact />
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="text-slate-400 transition-colors hover:text-white lg:hidden"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1.5">
            {appNav.map(({ label, href, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                    active
                      ? "bg-slate-800 font-semibold text-white"
                      : "font-medium text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                  }`}
                >
                  <Icon className="size-[18px]" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile footer */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800 p-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar ?? "/avatars/sarah.png"}
              alt={user.name}
              className="size-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-slate-500">{user.email}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
            >
              <LogOut className="size-[18px]" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { adminNav } from "@/lib/nav";
import { logout } from "@/app/actions/auth";

export default function AdminSidebar({
  user,
}: {
  user: { name: string; title: string; avatar: string | null };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500">
            <ShieldCheck className="size-4 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-[-0.5px] text-white">
            Vault
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[1px] text-amber-500">
            Admin
          </span>
        </Link>
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col justify-between border-r border-slate-700 bg-slate-900 px-5 pb-6 pt-8 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center justify-between pl-2">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500">
                <ShieldCheck className="size-4 text-white" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[22px] font-extrabold leading-none tracking-[-0.5px] text-white">
                  Vault
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[1px] text-amber-500">
                  Admin Panel
                </span>
              </div>
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="text-slate-400 transition-colors hover:text-white lg:hidden"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {adminNav.map(({ label, href, icon: Icon }) => {
              const active =
                href !== "#" &&
                (pathname === href ||
                  (href !== "/admin" && pathname.startsWith(`${href}/`)));
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] transition-colors ${
                    active
                      ? "bg-slate-800 font-semibold text-white"
                      : "font-medium text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile footer */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-800 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar ?? "/avatars/sarah.png"}
              alt={user.name}
              className="size-8 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-amber-500">{user.title}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

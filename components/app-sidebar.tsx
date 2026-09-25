"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { appNav } from "@/lib/nav";
import { logout } from "@/app/actions/auth";
import BrandLogo from "./brand-logo";

export default function AppSidebar({
  user,
}: {
  user: { name: string; email: string; avatar: string | null };
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar — navigation lives in the bottom tab bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <BrandLogo href="/dashboard" compact />
        <Link href="/profile" aria-label="Your profile" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar ?? "/avatars/sarah.png"}
            alt=""
            className="size-9 rounded-full object-cover ring-2 ring-slate-100"
          />
        </Link>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 px-5 pb-6 pt-8 lg:flex">
        <div className="flex flex-col gap-10">
          <div className="pl-2">
            <BrandLogo href="/dashboard" compact />
          </div>

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

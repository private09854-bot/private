"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth-shell";
import { login, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in to Vault"}
      {!pending && <ArrowRight className="size-4" />}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(login, initial);

  return (
    <AuthShell
      heading="Welcome back"
      subheading="Sign in to access your Vault console."
    >
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-semibold text-slate-900">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-semibold text-slate-900">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-500">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-[13px] text-slate-500">
        New to Vault?{" "}
        <Link
          href="/signup"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Open an account
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500">
          Demo credentials
        </p>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-500">Customer</span>
          <span className="font-mono font-semibold text-slate-900">
            sarah@jenkins.co / vault123
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-500">Admin</span>
          <span className="font-mono font-semibold text-slate-900">
            admin@vault.io / admin123
          </span>
        </div>
      </div>
    </AuthShell>
  );
}

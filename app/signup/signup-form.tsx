"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth-shell";
import PasswordField from "@/components/ui/password-field";
import { signup, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? "Creating account…" : "Create account"}
      {!pending && <ArrowRight className="size-4" />}
    </button>
  );
}

export default function SignupForm() {
  const [state, formAction] = useFormState(signup, initial);

  return (
    <AuthShell
      heading="Open an account"
      subheading="Four currency wallets, ready in about two minutes. No card required."
    >
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-[13px] font-semibold text-slate-900"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Cooper"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[13px] font-semibold text-slate-900"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Stacked on phones so neither field gets squeezed. */}
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-3">
          <div className="min-w-0 flex-1">
            <PasswordField
              id="password"
              name="password"
              label="Password"
              autoComplete="new-password"
            />
          </div>
          <div className="min-w-0 flex-1">
            <PasswordField
              id="confirm"
              name="confirm"
              label="Confirm password"
              autoComplete="new-password"
            />
          </div>
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-600">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

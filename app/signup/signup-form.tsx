"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth-shell";
import PasswordField from "@/components/ui/password-field";
import { COUNTRIES, countryByCode } from "@/lib/countries";
import { ACCOUNT_TYPES, SIGNUP_CURRENCIES } from "@/lib/account-options";
import { signup, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const LABEL = "text-[13px] font-semibold text-slate-900";

/** Latest date of birth that still makes the applicant 18, as yyyy-mm-dd. */
function maxDobToday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

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
  // Country drives the phone dial code, so it is the one piece of client state.
  const [countryCode, setCountryCode] = useState("US");
  const dial = countryByCode(countryCode)?.dial ?? "+1";

  return (
    <AuthShell
      heading="Open an account"
      subheading="Four currency wallets, ready in a few minutes. No card required."
    >
      <form action={formAction} className="flex flex-col gap-7">
        {/* ------------------------------------------------ personal */}
        <Section title="Your details">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
            <Field id="firstName" label="First name">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Jane"
                className={FIELD}
              />
            </Field>
            <Field id="lastName" label="Last name">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Cooper"
                className={FIELD}
              />
            </Field>
          </div>

          <Field id="middleName" label="Middle name (optional)">
            <input
              id="middleName"
              name="middleName"
              type="text"
              autoComplete="additional-name"
              placeholder="Amara"
              className={FIELD}
            />
          </Field>

          <Field
            id="dob"
            label="Date of birth"
            hint="You must be 18 or over to open an account."
          >
            <input
              id="dob"
              name="dob"
              type="date"
              autoComplete="bday"
              max={maxDobToday()}
              min="1906-01-01"
              className={FIELD}
            />
          </Field>
        </Section>

        {/* ------------------------------------------------- account */}
        <Section title="Your account">
          <Field
            id="username"
            label="Username"
            hint="3–20 characters. Letters, numbers and underscores only."
          >
            <div className="flex">
              <span className="flex shrink-0 items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                @
              </span>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="jane_cooper"
                className={`${FIELD} rounded-l-none`}
              />
            </div>
          </Field>

          <Field id="accountType" label="Account type">
            <select
              id="accountType"
              name="accountType"
              defaultValue="Savings"
              className={FIELD}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.desc}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="preferredCurrency"
            label="Primary currency"
            hint="You get all four wallets either way — this one becomes your default."
          >
            <select
              id="preferredCurrency"
              name="preferredCurrency"
              defaultValue="USD"
              className={FIELD}
            >
              {SIGNUP_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag}  {c.code} — {c.label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        {/* ------------------------------------------------- contact */}
        <Section title="Contact">
          <Field id="email" label="Email address">
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={FIELD}
            />
          </Field>

          {/* Country sits above the phone so the dial code below makes sense. */}
          <Field id="countryCode" label="Country of residence">
            <select
              id="countryCode"
              name="countryCode"
              autoComplete="country"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className={FIELD}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag}  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field id="phone" label="Phone number">
            <div className="flex gap-2">
              <span className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
                {dial}
              </span>
              <input type="hidden" name="dialCode" value={dial} />
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="7700 900123"
                className={FIELD}
              />
            </div>
          </Field>
        </Section>

        {/* ------------------------------------------------- address */}
        <Section title="Residential address">
          <Field id="addressLine" label="Street address">
            <input
              id="addressLine"
              name="addressLine"
              type="text"
              autoComplete="street-address"
              placeholder="24 Mercer Street, Apt 5"
              className={FIELD}
            />
          </Field>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
            <Field id="city" label="City">
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="New York"
                className={FIELD}
              />
            </Field>
            <Field id="postalCode" label="Postal / ZIP code">
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                autoComplete="postal-code"
                placeholder="10013"
                className={FIELD}
              />
            </Field>
          </div>

          <Field id="region" label="State / Province (optional)">
            <input
              id="region"
              name="region"
              type="text"
              autoComplete="address-level1"
              placeholder="New York"
              className={FIELD}
            />
          </Field>
        </Section>

        {/* ------------------------------------------------ security */}
        <Section title="Security">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
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
          <p className="-mt-1 text-[11px] text-slate-400">
            At least 8 characters. Use one you do not reuse anywhere else — this
            is a demonstration project and holds no real money.
          </p>

          <label
            htmlFor="terms"
            className="flex cursor-pointer items-start gap-3"
          >
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-[13px] leading-relaxed text-slate-600">
              I confirm the details above are mine and I accept the{" "}
              <span className="font-semibold text-emerald-700">
                Terms of Use
              </span>{" "}
              and{" "}
              <span className="font-semibold text-emerald-700">
                Privacy Policy
              </span>
              .
            </span>
          </label>
        </Section>

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

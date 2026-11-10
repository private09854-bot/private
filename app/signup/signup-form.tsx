"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import Select, { type StylesConfig } from "react-select";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import AuthShell from "@/components/auth-shell";
import PasswordField from "@/components/ui/password-field";
import { COUNTRIES } from "@/lib/countries";
import { languagesForCountry, type CountryLanguageOption } from "@/lib/languages";
import { ACCOUNT_TYPES, SIGNUP_CURRENCIES } from "@/lib/account-options";
import { signup, type AuthState } from "@/app/actions/auth";
import { I18nText } from "@/components/i18n-text";

const initial: AuthState = {};

const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const LABEL = "text-[13px] font-semibold text-slate-900";

type CountryOption = { value: string; label: string };

const countryOptions: CountryOption[] = COUNTRIES.map((country) => ({
  value: country.code,
  label: `${country.flag} ${country.name}`,
}));

const selectStyles: StylesConfig<CountryOption | CountryLanguageOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    borderColor: state.isFocused ? "#10b981" : "#e2e8f0",
    borderRadius: 8,
    boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
    ":hover": { borderColor: "#10b981" },
  }),
  menu: (base) => ({ ...base, zIndex: 30 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#059669" : state.isFocused ? "#ecfdf5" : "white",
    color: state.isSelected ? "white" : "#0f172a",
  }),
};

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
        <I18nText source={title} />
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
        <I18nText source={label} />
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400"><I18nText source={hint} /></p>}
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
      {pending ? <I18nText i18nKey="ui.1gdkki9" source="Creating account…" /> : <I18nText i18nKey="ui.mfp3qa" source="Create account" />}
      {!pending && <ArrowRight className="size-4" />}
    </button>
  );
}

export default function SignupForm() {
  const [state, formAction] = useFormState(signup, initial);
  const [countryCode, setCountryCode] = useState("US");
  const [preferredLanguage, setPreferredLanguage] = useState<CountryLanguageOption | null>(null);
  const [phone, setPhone] = useState("");
  const languageOptions = languagesForCountry(countryCode);

  function selectCountry(option: CountryOption | null) {
    const nextCountryCode = option?.value ?? "";
    setCountryCode(nextCountryCode);
    setPreferredLanguage((current) =>
      current && languagesForCountry(nextCountryCode).some((language) => language.value === current.value)
        ? current
        : null,
    );
  }

  return (
    <AuthShell
      heading="Open an account"
      subheading="Four currency wallets, ready in a few minutes. No card required."
    >
      <form action={formAction} className="flex flex-col gap-7">
        {/* ------------------------------------------------ personal */}
        <Section title="Your details" data-i18n-title={"[\"ui.f0azo\",\"Your details\"]"}>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
            <Field id="firstName" label="First name">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Jane" data-i18n-placeholder={"[\"ui.y6xor5\",\"Jane\"]"}
                className={FIELD}
              />
            </Field>
            <Field id="lastName" label="Last name">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Cooper" data-i18n-placeholder={"[\"ui.amxbdb\",\"Cooper\"]"}
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
              placeholder="Amara" data-i18n-placeholder={"[\"ui.1232zlj\",\"Amara\"]"}
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
        <Section title="Your account" data-i18n-title={"[\"ui.4cg6m9\",\"Your account\"]"}>
          <Field
            id="username"
            label="Username"
            hint="3–20 characters. Letters, numbers and underscores only."
          >
            <div className="flex">
              <span className="flex shrink-0 items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                <I18nText i18nKey="ui.1io8tpb" source="@" /></span>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="jane_cooper" data-i18n-placeholder={"[\"ui.qwhthk\",\"jane_cooper\"]"}
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
                  <I18nText source={t.label} /> <I18nText i18nKey="ui.4s9bsz" source="—" /><I18nText source={t.desc} />
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
                  {c.flag}  {c.code} <I18nText i18nKey="ui.4s9bsz" source="—" /><I18nText source={c.label} />
                </option>
              ))}
            </select>
          </Field>
        </Section>

        {/* ------------------------------------------------- contact */}
        <Section title="Contact" data-i18n-title={"[\"ui.w3fq2r\",\"Contact\"]"}>
          <Field id="email" label="Email address">
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com" data-i18n-placeholder={"[\"ui.1f9hkpt\",\"you@example.com\"]"}
              className={FIELD}
            />
          </Field>

          <Field id="countryCode" label="Country of residence">
            <input type="hidden" name="countryCode" value={countryCode} />
            <Select
              id="countryCode"
              inputId="countryCode"
              options={countryOptions}
              value={countryOptions.find((option) => option.value === countryCode)}
              onChange={selectCountry}
              placeholder="Search for a country"
              isSearchable
              styles={selectStyles}
            />
          </Field>

          <Field id="preferredLanguage" label="Preferred language">
            <input type="hidden" name="preferredLanguage" value={preferredLanguage?.value ?? ""} />
            <Select<CountryLanguageOption, false>
              inputId="preferredLanguage"
              options={languageOptions}
              value={preferredLanguage}
              onChange={setPreferredLanguage}
              placeholder={languageOptions.length ? "Search for a language" : "No language data available for this country"}
              noOptionsMessage={() => "No matching languages found"}
              isSearchable
              isClearable
              isDisabled={!languageOptions.length}
              filterOption={(candidate, input) =>
                candidate.data.searchText.includes(input.toLocaleLowerCase())
              }
              formatOptionLabel={(option) => (
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm text-slate-900">{option.nativeName}</span>
                  <span className="truncate text-xs text-slate-500">{option.englishName}</span>
                </span>
              )}
              getOptionLabel={(option) => `${option.nativeName} — ${option.englishName}`}
              styles={selectStyles}
            />
          </Field>

          <Field id="phone" label="Phone number">
            <PhoneInput
              defaultCountry="us"
              value={phone}
              onChange={setPhone}
              name="phone"
              inputProps={{ id: "phone", autoComplete: "tel", inputMode: "tel" }}
              className="w-full rounded-lg border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500"
              inputClassName="w-full rounded-r-lg bg-transparent py-3 text-sm text-slate-900 outline-none"
              countrySelectorStyleProps={{ buttonClassName: "rounded-l-lg border-r border-slate-200 bg-slate-50" }}
            />
          </Field>
        </Section>

        {/* ------------------------------------------------- address */}
        <Section title="Residential address" data-i18n-title={"[\"ui.1sj0e25\",\"Residential address\"]"}>
          <Field id="addressLine" label="Street address">
            <input
              id="addressLine"
              name="addressLine"
              type="text"
              autoComplete="street-address"
              placeholder="24 Mercer Street, Apt 5" data-i18n-placeholder={"[\"ui.xci2zy\",\"24 Mercer Street, Apt 5\"]"}
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
                placeholder="New York" data-i18n-placeholder={"[\"ui.zatwy0\",\"New York\"]"}
                className={FIELD}
              />
            </Field>
            <Field id="postalCode" label="Postal / ZIP code">
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                autoComplete="postal-code"
                placeholder="10013" data-i18n-placeholder={"[\"ui.tyf5v0\",\"10013\"]"}
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
              placeholder="New York" data-i18n-placeholder={"[\"ui.zatwy0\",\"New York\"]"}
              className={FIELD}
            />
          </Field>
        </Section>

        {/* ------------------------------------------------ security */}
        <Section title="Security" data-i18n-title={"[\"ui.1i3q76j\",\"Security\"]"}>
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
            <I18nText i18nKey="ui.1xgrbjm" source="At least 8 characters. Use one you do not reuse anywhere else — this is a demonstration project and holds no real money." /></p>

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
              <I18nText i18nKey="ui.1cjfq1q" source="I confirm the details above are mine and I accept the" />{" "}
              <span className="font-semibold text-emerald-700">
                <I18nText i18nKey="ui.1wr163q" source="Terms of Use" /></span>{" "}
              <I18nText i18nKey="ui.47gkh2" source="and" />{" "}
              <span className="font-semibold text-emerald-700">
                <I18nText i18nKey="ui.ab2tcv" source="Privacy Policy" /></span>
              <I18nText i18nKey="ui.by08hd" source="." /></span>
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
        <I18nText i18nKey="ui.nuf7je" source="Already have an account?" />{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <I18nText i18nKey="ui.w9nig3" source="Sign in" /></Link>
      </p>
    </AuthShell>
  );
}

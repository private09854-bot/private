"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { setLocale } from "@/components/i18n-provider";
import { supportedLanguages } from "@/lib/i18n/resources";

const LANGUAGE_LABELS: Record<(typeof supportedLanguages)[number], string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  he: "עברית",
};

export default function LanguagePreference() {
  const { i18n, t } = useTranslation();
  const [changing, setChanging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const activeLocale = (i18n.resolvedLanguage ?? i18n.language)
    .split("-")[0]
    .toLowerCase();
  const selectedLocale = supportedLanguages.includes(
    activeLocale as (typeof supportedLanguages)[number],
  )
    ? activeLocale
    : "en";

  async function handleChange(locale: string) {
    setHasError(false);
    setChanging(true);
    try {
      await setLocale(locale);
    } catch {
      setHasError(true);
    } finally {
      setChanging(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-slate-900">
          {t("common.languageSettings")}
        </h2>
        <p className="text-[13px] text-slate-500">
          {t("common.languageDescription")}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="interface-language"
          className="text-[13px] font-semibold text-slate-900"
        >
          {t("common.language")}
        </label>
        <select
          id="interface-language"
          value={selectedLocale}
          disabled={changing}
          onChange={(event) => void handleChange(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
        >
          {supportedLanguages.map((locale) => (
            <option key={locale} value={locale}>
              {LANGUAGE_LABELS[locale]}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-slate-500">
        {t("common.translationCoverageNotice")}
      </p>
      {hasError && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {t("common.languageChangeError")}
        </p>
      )}
    </section>
  );
}

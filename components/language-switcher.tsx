"use client";

import { Languages, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { localeName, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/i18n/config";
import { currentLocale, setLocale } from "./i18n-provider";
import { updateLocalePreference } from "@/app/actions/preferences";

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<SupportedLocale>(currentLocale());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function changeLanguage(next: string) {
    setPending(true); setError(false);
    try { const locale = await setLocale(next); setLanguage(locale); void updateLocalePreference(locale); }
    catch { setError(true); }
    finally { setPending(false); }
  }

  return <div className="notranslate fixed bottom-20 right-4 z-[1000] flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg lg:bottom-4" translate="no">
    {pending ? <LoaderCircle className="size-4 animate-spin text-slate-600" /> : <Languages className="size-4 text-slate-600" aria-hidden="true" />}
    <label htmlFor="site-language" className="sr-only">{t("common.language")}</label>
    <select id="site-language" value={language} onChange={(event) => void changeLanguage(event.target.value)} disabled={pending} className="max-w-36 bg-transparent text-xs font-semibold text-slate-800 outline-none disabled:opacity-60">
      {SUPPORTED_LOCALES.map((code) => <option key={code} value={code}>{localeName(code)}</option>)}
    </select>
    {error && (
      <span role="alert" className="max-w-48 text-xs text-red-700">
        {t("common.languageError")}
      </span>
    )}
  </div>;
}

"use client";

import { useEffect, useState } from "react";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { englishResource, rtlLanguages, supportedLanguages } from "@/lib/i18n/resources";
import { I18nAttributeProvider } from "@/components/i18n-text";

const STORAGE_KEY = "bank.language";

let initialization: Promise<void> | undefined;

function normalizeLocale(value: string) {
  const candidate = value.trim().replace(/_/g, "-") || "en";
  try {
    return Intl.getCanonicalLocales(candidate)[0] ?? "en";
  } catch {
    return "en";
  }
}

function toSupportedLocale(value: string) {
  const normalized = normalizeLocale(value).toLowerCase();
  const primary = normalized.split("-")[0];
  if (supportedLanguages.includes(normalized as (typeof supportedLanguages)[number])) return normalized;
  if (supportedLanguages.includes(primary as (typeof supportedLanguages)[number])) return primary;
  return "en";
}

function isRtlLocale(locale: string) {
  return rtlLanguages.includes(locale.split("-")[0].toLowerCase() as (typeof rtlLanguages)[number]);
}

function applyDocumentDirection(locale: string) {
  const normalized = toSupportedLocale(locale);
  const direction = isRtlLocale(normalized) ? "rtl" : "ltr";
  document.documentElement.lang = normalized;
  document.documentElement.dir = direction;
  document.documentElement.style.direction = direction;
}

function getStoredLocale() {
  if (typeof window === "undefined") return "en";
  const candidate = window.localStorage.getItem(STORAGE_KEY) ?? "en";
  return toSupportedLocale(candidate);
}

async function loadLocaleResource(locale: string) {
  const normalized = toSupportedLocale(locale);
  if (normalized.toLowerCase().startsWith("en")) return englishResource;

  try {
    const apiResponse = await fetch(`/api/i18n/${encodeURIComponent(normalized)}`, {
      cache: "no-store",
    });
    if (!apiResponse.ok) throw new Error(`Translation service returned ${apiResponse.status}.`);
    const translated = (await apiResponse.json()) as typeof englishResource;
    return {
      ...englishResource,
      ...translated,
      common: { ...englishResource.common, ...translated.common },
      signup: { ...englishResource.signup, ...translated.signup },
      ui: { ...englishResource.ui, ...translated.ui },
    };
  } catch (error) {
    console.warn(
      `[i18n] Full ${normalized} translations are unavailable; using the authored catalog and English fallback.`,
      error,
    );
  }

  try {
    const publicResource = await fetch(`/locales/${encodeURIComponent(normalized)}/translation.json`, {
      cache: "no-store",
    });
    if (publicResource.ok) {
      const authored = (await publicResource.json()) as typeof englishResource;
      return {
        ...englishResource,
        ...authored,
        common: { ...englishResource.common, ...authored.common },
        signup: { ...englishResource.signup, ...authored.signup },
        ui: { ...englishResource.ui, ...authored.ui },
      };
    }
  } catch {
    // No authored catalog is available; i18next uses English as its fallback.
  }
  return englishResource;
}

function configureI18n() {
  if (!initialization) {
    initialization = i18n
      .use(initReactI18next)
      .init({
        lng: getStoredLocale(),
        supportedLngs: [...supportedLanguages],
        fallbackLng: "en",
        defaultNS: "translation",
        resources: { en: { translation: englishResource } },
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
      })
      .then(async () => {
        const locale = getStoredLocale();
        applyDocumentDirection(locale);
        if (locale !== "en") {
          const resource = await loadLocaleResource(locale);
          i18n.addResourceBundle(locale, "translation", resource, true, true);
        }
      })
      .then(() => undefined);
  }
  return initialization;
}

export async function setLocale(localeValue: string) {
  await configureI18n();
  const normalizedLocale = toSupportedLocale(localeValue);

  const resource = await loadLocaleResource(normalizedLocale);
  i18n.addResourceBundle(normalizedLocale, "translation", resource, true, true);
  await i18n.changeLanguage(normalizedLocale);
  applyDocumentDirection(normalizedLocale);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, normalizedLocale);
  }

  return normalizedLocale;
}

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void configureI18n().then(() => {
      const locale = getStoredLocale();
      if (locale !== i18n.language) {
        void setLocale(locale).catch(() => undefined);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <I18nAttributeProvider />
      {children}
    </I18nextProvider>
  );
}

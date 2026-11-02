"use client";

import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { useEffect } from "react";
import { englishResource } from "@/lib/i18n/resources";
import { RTL_LOCALES, resolveLocale, type SupportedLocale } from "@/lib/i18n/config";
import { I18nAttributeProvider } from "@/components/i18n-text";

const STORAGE_KEY = "profintal-language";
const RESOURCE_VERSION = "v2";
let initialization: Promise<void> | undefined;

function configureI18n() {
  if (!initialization) {
    initialization = i18n
      .use(initReactI18next)
      .init({
        lng: "en",
        fallbackLng: "en",
        resources: { en: { translation: englishResource } },
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
      })
      .then(() => undefined);
  }
  return initialization;
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Translation still works for the current page when browser storage is unavailable.
  }
}

function browserLocale(): SupportedLocale {
  return resolveLocale(
    readStorage(STORAGE_KEY) ?? navigator.languages?.[0] ?? navigator.language,
  );
}

function cachedResource(locale: SupportedLocale) {
  const raw = readStorage(`profintal-i18n-${RESOURCE_VERSION}-${locale}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setLocale(localeValue: string) {
  await configureI18n();

  const locale = resolveLocale(localeValue);
  let resource = locale === "en" ? englishResource : cachedResource(locale);

  if (!resource) {
    const response = await fetch(`/api/i18n/${locale}?v=${RESOURCE_VERSION}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Unable to load translations (${response.status}).`);
    }

    resource = await response.json();
    writeStorage(
      `profintal-i18n-${RESOURCE_VERSION}-${locale}`,
      JSON.stringify(resource),
    );
  }

  i18n.addResourceBundle(locale, "translation", resource, true, true);
  await i18n.changeLanguage(locale);
  writeStorage(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  return locale;
}

export function currentLocale() {
  return resolveLocale(i18n.language);
}

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  void configureI18n();

  useEffect(() => {
    void setLocale(browserLocale()).catch((error: unknown) => {
      console.error("[i18n] Unable to load the saved language.", error);
    });
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <I18nAttributeProvider />
      {children}
    </I18nextProvider>
  );
}

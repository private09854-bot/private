"use client";

import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { englishResource } from "@/lib/i18n/resources";
import { I18nAttributeProvider } from "@/components/i18n-text";

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

function normalizeLocale(value: string) {
  const candidate = value.trim().replace(/_/g, "-") || "en";
  try {
    return Intl.getCanonicalLocales(candidate)[0] ?? "en";
  } catch {
    return "en";
  }
}

export async function setLocale(localeValue: string) {
  await configureI18n();
  const locale = normalizeLocale(localeValue);
  const resource = locale.toLowerCase().startsWith("en")
    ? englishResource
    : await fetch(`/api/i18n/${encodeURIComponent(locale)}`, { cache: "no-store" }).then(
        async (response) => {
          if (!response.ok) throw new Error(`Unable to load translations (${response.status}).`);
          return response.json();
        },
      );

  i18n.addResourceBundle(locale, "translation", resource, true, true);
  await i18n.changeLanguage(locale);
  document.documentElement.lang = locale;
  return locale;
}

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  void configureI18n();

  return (
    <I18nextProvider i18n={i18n}>
      <I18nAttributeProvider />
      {children}
    </I18nextProvider>
  );
}

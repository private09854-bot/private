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

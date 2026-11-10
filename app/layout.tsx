import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import CountryLanguagePicker from "@/components/country-language-picker";
import I18nProvider from "@/components/i18n-provider";

export const metadata: Metadata = {
  title: "Profintal Savings",
  description: "Secure checking, savings, transfers, and card controls.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <I18nProvider>{children}<CountryLanguagePicker /></I18nProvider>
      </body>
    </html>
  );
}

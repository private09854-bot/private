"use client";

import { Languages } from "lucide-react";
import { useEffect, useState } from "react";

// Google Translate's current language catalogue. Keeping this list local means
// visitors can choose any supported language, not just a small preset group.
const languages = [
  "af", "sq", "am", "ar", "hy", "as", "ay", "az", "bm", "eu", "be", "bn",
  "bho", "bs", "bg", "ca", "ceb", "zh-CN", "zh-TW", "co", "hr", "cs", "da",
  "dv", "doi", "nl", "en", "eo", "et", "ee", "tl", "fi", "fr", "fy", "gl",
  "ka", "de", "el", "gn", "gu", "ht", "ha", "haw", "he", "hi", "hmn", "hu",
  "is", "ig", "ilo", "id", "ga", "it", "ja", "jv", "kn", "kk", "km", "rw",
  "gom", "ko", "kri", "ku", "ckb", "ky", "lo", "la", "lv", "ln", "lt", "lg",
  "lb", "mk", "mai", "mg", "ms", "ml", "mt", "mi", "mr", "mni-Mtei", "mn",
  "my", "ne", "no", "ny", "or", "om", "ps", "fa", "pl", "pt", "pa", "qu",
  "ro", "ru", "sm", "sa", "gd", "nso", "sr", "st", "sn", "sd", "si", "sk",
  "sl", "so", "es", "su", "sw", "sv", "tg", "ta", "tt", "te", "th", "ti",
  "ts", "tr", "tk", "ak", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi",
  "yo", "zu",
] as const;

type LanguageCode = (typeof languages)[number];
const codes = new Set<string>(languages);

function languageLabel(code: LanguageCode) {
  const labelCode = code === "zh-CN" || code === "zh-TW" ? "zh" : code;
  try {
    return new Intl.DisplayNames([labelCode], { type: "language" }).of(labelCode) ?? code;
  } catch {
    return code;
  }
}

function browserLanguage(): LanguageCode {
  const value = navigator.language;
  const lower = value.toLowerCase();
  if (lower.startsWith("zh-tw") || lower.startsWith("zh-hk") || lower.includes("hant")) return "zh-TW";
  if (lower.startsWith("zh")) return "zh-CN";
  if (codes.has(value)) return value as LanguageCode;
  const base = lower.split("-")[0];
  return (codes.has(base) ? base : "en") as LanguageCode;
}

function setGoogleLanguage(language: LanguageCode) {
  document.cookie = `googtrans=/en/${language}; path=/; SameSite=Lax`;
  document.documentElement.lang = language;
}

/**
 * Lets visitors read the entire interface in their browser language. The
 * Google Translate page widget also translates text added by client screens.
 */
export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("profintal-language");
    const selected = codes.has(saved ?? "") ? (saved as LanguageCode) : browserLanguage();
    setLanguage(selected);
    setGoogleLanguage(selected);

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      window.googleTranslateElementInit = () => {
        const google = window.google;
        if (!google?.translate) return;
        new google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false, includedLanguages: languages.join(",") },
          "google_translate_element",
        );
      };
      document.body.appendChild(script);
    }
  }, []);

  function changeLanguage(next: LanguageCode) {
    window.localStorage.setItem("profintal-language", next);
    setGoogleLanguage(next);
    window.location.reload();
  }

  return (
    <div className="notranslate fixed bottom-20 right-4 z-[1000] flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg lg:bottom-4" translate="no">
      <Languages className="size-4 text-slate-600" aria-hidden="true" />
      <label htmlFor="site-language" className="sr-only">Language</label>
      <select
        id="site-language"
        value={language}
        onChange={(event) => changeLanguage(event.target.value as LanguageCode)}
        className="max-w-36 bg-transparent text-xs font-semibold text-slate-800 outline-none"
      >
        {languages.map((code) => <option key={code} value={code}>{languageLabel(code)}</option>)}
      </select>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
    </div>
  );
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay: boolean; includedLanguages: string },
          elementId: string,
        ) => unknown;
      };
    };
  }
}

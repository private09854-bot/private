export const SUPPORTED_LOCALES = ["af", "am", "ar", "az", "be", "bg", "bn", "bs", "ca", "ceb", "cs", "cy", "da", "de", "el", "en", "es", "et", "eu", "fa", "fi", "fil", "fr", "fy", "ga", "gd", "gl", "gu", "ha", "haw", "he", "hi", "hmn", "hr", "ht", "hu", "hy", "id", "ig", "is", "it", "ja", "jv", "ka", "kk", "km", "kn", "ko", "ku", "ky", "la", "lb", "lo", "lt", "lv", "mg", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "ne", "nl", "no", "ny", "or", "pa", "pl", "ps", "pt", "ro", "ru", "sd", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "tr", "uk", "ur", "uz", "vi", "xh", "yi", "yo", "zh-CN", "zh-TW", "zu"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const supported = new Set<string>(SUPPORTED_LOCALES);
export const RTL_LOCALES = new Set(["ar", "fa", "he", "ku", "ps", "sd", "ur"]);
export function resolveLocale(value: string | null | undefined): SupportedLocale {
  const locale = value?.replace("_", "-") ?? "";
  const lower = locale.toLowerCase();
  if (lower.startsWith("zh-hk") || lower.startsWith("zh-tw") || lower.includes("hant")) return "zh-TW";
  if (lower.startsWith("zh")) return "zh-CN";
  if (supported.has(locale)) return locale as SupportedLocale;
  const language = lower.split("-")[0];
  return (supported.has(language) ? language : "en") as SupportedLocale;
}
export function localeName(locale: SupportedLocale): string {
  const nameLocale = locale.startsWith("zh-") ? "zh" : locale;
  try { return new Intl.DisplayNames([nameLocale], { type: "language" }).of(nameLocale) ?? locale; } catch { return locale; }
}

import { englishResource, type TranslationResource } from "./resources";
import { resolveLocale, type SupportedLocale } from "./config";
type CacheEntry = { expiresAt: number; resource: TranslationResource };
const cache = new Map<string, CacheEntry>();
function strings(resource: TranslationResource) { return Object.values(resource).flatMap((section) => Object.values(section)); }
function rebuild(resource: TranslationResource, values: string[]): TranslationResource { let index = 0; return Object.fromEntries(Object.entries(resource).map(([section, entries]) => [section, Object.fromEntries(Object.keys(entries).map((key) => [key, values[index++] ?? entries[key as keyof typeof entries]]))])) as TranslationResource; }
async function translateWithGoogle(text: string[], target: SupportedLocale) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("Google Cloud Translation is not configured.");
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: text, source: "en", target, format: "text" }), cache: "no-store" });
  if (!response.ok) throw new Error(`Translation provider returned ${response.status}.`);
  const data = await response.json() as { data?: { translations?: { translatedText?: string }[] } };
  const translations = data.data?.translations?.map((item) => item.translatedText ?? "") ?? [];
  if (translations.length !== text.length || translations.some((item) => !item)) throw new Error("Translation provider returned an incomplete response.");
  return translations;
}
export async function translationResource(localeValue: string): Promise<TranslationResource> {
  const locale = resolveLocale(localeValue); if (locale === "en") return englishResource;
  const saved = cache.get(locale); if (saved && saved.expiresAt > Date.now()) return saved.resource;
  const resource = rebuild(englishResource, await translateWithGoogle(strings(englishResource), locale));
  cache.set(locale, { resource, expiresAt: Date.now() + 86_400_000 }); return resource;
}

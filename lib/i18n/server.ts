import { englishResource, type TranslationResource } from "./resources";
import { resolveLocale, type SupportedLocale } from "./config";

type CacheEntry = { expiresAt: number; resource: TranslationResource };
type ResourceNode = { [key: string]: string | ResourceNode };
const cache = new Map<string, CacheEntry>();

function strings(resource: ResourceNode): string[] {
  return Object.values(resource).flatMap((value) =>
    typeof value === "string" ? [value] : strings(value),
  );
}

function rebuild(resource: ResourceNode, values: string[]): ResourceNode {
  let index = 0;
  return Object.fromEntries(
    Object.entries(resource).map(([key, value]) => [
      key,
      typeof value === "string" ? values[index++] ?? value : rebuild(value, values),
    ]),
  );
}

function batches(values: string[]) {
  const result: string[][] = [];
  let batch: string[] = [];
  let characters = 0;

  for (const value of values) {
    if (batch.length >= 100 || characters + value.length > 25_000) {
      result.push(batch);
      batch = [];
      characters = 0;
    }
    batch.push(value);
    characters += value.length;
  }
  if (batch.length) result.push(batch);
  return result;
}

async function translateWithGoogle(text: string[], target: SupportedLocale) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("Google Cloud Translation is not configured.");

  const translations: string[] = [];
  for (const batch of batches(text)) {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: batch,
          source: "en",
          target,
          format: "text",
        }),
        cache: "no-store",
      },
    );
    const data = (await response.json()) as {
      data?: { translations?: { translatedText?: string }[] };
      error?: { message?: string };
    };
    if (!response.ok) {
      throw new Error(
        data.error?.message
          ? `Google Cloud Translation returned ${response.status}: ${data.error.message}`
          : `Google Cloud Translation returned ${response.status}.`,
      );
    }

    const translatedBatch =
      data.data?.translations?.map((item) => item.translatedText ?? "") ?? [];
    if (
      translatedBatch.length !== batch.length ||
      translatedBatch.some((item) => !item)
    ) {
      throw new Error("Google Cloud Translation returned an incomplete response.");
    }
    translations.push(...translatedBatch);
  }
  return translations;
}

export async function translationResource(
  localeValue: string,
): Promise<TranslationResource> {
  const locale = resolveLocale(localeValue);
  if (locale === "en") return englishResource;

  const saved = cache.get(locale);
  if (saved && saved.expiresAt > Date.now()) return saved.resource;

  const resource = rebuild(
    englishResource,
    await translateWithGoogle(strings(englishResource), locale),
  ) as TranslationResource;
  cache.set(locale, { resource, expiresAt: Date.now() + 86_400_000 });
  return resource;
}

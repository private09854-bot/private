import { language, languages } from "@worldkit/languages";
import languageMap from "langmap";

export type CountryLanguageOption = {
  value: string;
  englishName: string;
  nativeName: string;
  searchText: string;
};

/**
 * Builds language options from the installed datasets. WorldKit determines
 * languages for an ISO country code; langmap enriches those languages and
 * adds country-specific regional locale variants when it provides them.
 */
export function languagesForCountry(countryCode: string): CountryLanguageOption[] {
  const country = countryCode.toUpperCase();
  const options = new Map<string, CountryLanguageOption>();

  const add = (code: string, englishName?: string, nativeName?: string) => {
    const normalizedCode = code.toLowerCase();
    const mapEntry = languageMap[code] ?? languageMap[normalizedCode];
    const worldKitLanguage = language(normalizedCode.split("-")[0]);
    const english = englishName ?? mapEntry?.englishName ?? worldKitLanguage?.name;
    const native = nativeName ?? mapEntry?.nativeName ?? worldKitLanguage?.nativeName;

    if (!english || !native) return;

    options.set(normalizedCode, {
      value: normalizedCode,
      englishName: english,
      nativeName: native,
      searchText: `${english} ${native} ${normalizedCode}`.toLocaleLowerCase(),
    });
  };

  for (const code of languages(country)) {
    add(code);
  }

  for (const [locale, entry] of Object.entries(languageMap)) {
    const localeCountry = locale.split("-")[1]?.toUpperCase();
    if (localeCountry === country) {
      add(locale, entry.englishName, entry.nativeName);
    }
  }

  return [...options.values()].sort((a, b) =>
    a.englishName.localeCompare(b.englishName) || a.nativeName.localeCompare(b.nativeName),
  );
}

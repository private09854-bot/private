import { language, languages } from "@worldkit/languages";
import languageMap from "langmap";

export type CountryLanguageOption = {
  value: string;
  englishName: string;
  nativeName: string;
  searchText: string;
};

const regionalLanguagesByCountry = new Map<string, Set<string>>();

for (const locale of Object.keys(languageMap)) {
  const parts = locale.split("-");
  const country = parts[parts.length - 1]?.toUpperCase();
  if (!country || parts.length < 2) continue;

  const regionalLanguages = regionalLanguagesByCountry.get(country) ?? new Set<string>();
  regionalLanguages.add(parts[0].toLowerCase());
  regionalLanguagesByCountry.set(country, regionalLanguages);
}

const spanishSpeakingCountryCodes = new Set([
  "AD",
  "AR",
  "BO",
  "BZ",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "ES",
  "GQ",
  "GT",
  "HN",
  "MX",
  "NI",
  "PA",
  "PE",
  "PR",
  "PY",
  "SV",
  "US",
  "UY",
  "VE",
]);

function countryHasLanguageData(country: string, primaryLanguage: string) {
  const worldKitHasLanguage = languages(country).some(
    (code) => code.toLowerCase().split("-")[0] === primaryLanguage,
  );
  return (
    worldKitHasLanguage ||
    regionalLanguagesByCountry.get(country)?.has(primaryLanguage) === true
  );
}

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
    // Locale datasets can include scripts, e.g. `zh-Hans-CN`; the country is
    // always the final segment rather than necessarily the second segment.
    const localeParts = locale.split("-");
    const localeCountry = localeParts[localeParts.length - 1]?.toUpperCase();
    if (localeCountry === country) {
      add(locale, entry.englishName, entry.nativeName);
    }
  }

  if (
    countryUsesLanguage(country, "es") &&
    ![...options.keys()].some((code) => code.split("-")[0] === "es")
  ) {
    add("es");
  }

  return [...options.values()].sort((a, b) =>
    a.englishName.localeCompare(b.englishName) || a.nativeName.localeCompare(b.nativeName),
  );
}

export function countryUsesLanguage(countryCode: string, languageCode: string): boolean {
  const country = countryCode.toUpperCase();
  const primaryLanguage = languageCode.toLowerCase().split("-")[0];
  return (
    (primaryLanguage === "es" && spanishSpeakingCountryCodes.has(country)) ||
    countryHasLanguageData(country, primaryLanguage)
  );
}

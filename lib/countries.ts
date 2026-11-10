import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

/**
 * ISO 3166-1 country reference shared by sign-up, profile, and KYC. The
 * complete list replaces the former hand-maintained subset.
 */
export type Country = {
  code: string;
  name: string;
  flag: string;
  dial: string;
};

countries.registerLocale(en);

function flagFor(code: string) {
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((letter) => 127397 + letter.charCodeAt(0)),
  );
}

export const COUNTRIES: Country[] = Object.entries(countries.getNames("en"))
  .map(([code, name]) => ({ code, name, flag: flagFor(code), dial: "" }))
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function countryByCode(code: string | null | undefined): Country | null {
  return (code && BY_CODE.get(code.toUpperCase())) || null;
}

/** Flag for a stored country code, falling back to a neutral flag. */
export function countryFlag(code: string | null | undefined): string {
  return countryByCode(code)?.flag ?? "🏳️";
}

/** Readable country name for a stored code. */
export function countryName(code: string | null | undefined): string {
  return countryByCode(code)?.name ?? "—";
}

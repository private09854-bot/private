/**
 * Country reference used by the sign-up form and anywhere a country needs to
 * be rendered. `code` is the ISO 3166-1 alpha-2 value stored on the profile;
 * `flag` is what the existing admin/profile UI displays.
 */
export type Country = {
  code: string;
  name: string;
  flag: string;
  dial: string;
};

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", dial: "+1" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dial: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dial: "+353" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dial: "+61" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dial: "+64" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dial: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", dial: "+33" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dial: "+34" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dial: "+39" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dial: "+351" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dial: "+31" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dial: "+32" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dial: "+41" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dial: "+43" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dial: "+46" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dial: "+47" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dial: "+45" },
  { code: "FI", name: "Finland", flag: "🇫🇮", dial: "+358" },
  { code: "PL", name: "Poland", flag: "🇵🇱", dial: "+48" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿", dial: "+420" },
  { code: "GR", name: "Greece", flag: "🇬🇷", dial: "+30" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dial: "+234" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dial: "+233" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dial: "+254" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dial: "+27" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dial: "+20" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", dial: "+212" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dial: "+966" },
  { code: "TR", name: "Türkiye", flag: "🇹🇷", dial: "+90" },
  { code: "IN", name: "India", flag: "🇮🇳", dial: "+91" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dial: "+92" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dial: "+880" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dial: "+65" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dial: "+60" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dial: "+62" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dial: "+63" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dial: "+66" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dial: "+84" },
  { code: "CN", name: "China", flag: "🇨🇳", dial: "+86" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dial: "+81" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dial: "+82" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", dial: "+852" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dial: "+55" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dial: "+52" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dial: "+54" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dial: "+56" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dial: "+57" },
];

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

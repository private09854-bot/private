/**
 * Choices offered at sign-up. Kept in a plain module (not the "use server"
 * actions file, which may only export async functions) so both the client form
 * and the server action validate against exactly the same lists.
 */

export const ACCOUNT_TYPES = [
  {
    value: "Savings",
    label: "Savings",
    desc: "Everyday balance with no monthly fee",
  },
  {
    value: "Checking",
    label: "Checking",
    desc: "For frequent transfers and card spending",
  },
  {
    value: "Business",
    label: "Business",
    desc: "For contractors, freelancers and small teams",
  },
];

export const ACCOUNT_TYPE_VALUES = ACCOUNT_TYPES.map((t) => t.value);

export const SIGNUP_CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", label: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", label: "British Pound", flag: "🇬🇧" },
  { code: "CAD", symbol: "$", label: "Canadian Dollar", flag: "🇨🇦" },
];

export const SIGNUP_CURRENCY_CODES = SIGNUP_CURRENCIES.map((c) => c.code);

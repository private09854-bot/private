import { uiResource } from "./ui-resource";

export const supportedLanguages = ["en", "es", "fr", "de", "ar", "he"] as const;
export const rtlLanguages = ["ar", "he", "fa", "ur"] as const;

export const englishResource = {
  common: {
    language: "Language",
    languageError: "We could not load that language. English is being shown.",
    signIn: "Sign in",
    signOut: "Sign out",
    createAccount: "Create account",
    creatingAccount: "Creating account…",
    saveChanges: "Save changes",
    cancel: "Cancel",
    dashboard: "Dashboard",
    wallets: "Wallets",
    send: "Send",
    withdraw: "Withdraw",
    recipients: "Recipients",
    transactions: "Transactions",
    cards: "Cards",
    profile: "Profile",
    verification: "Verification",
    settings: "Settings",
    more: "More",
    allFeatures: "All features",
  },
  signup: {
    heading: "Open an account",
    subheading: "Four currency wallets, ready in a few minutes. No card required.",
    details: "Your details",
    account: "Your account",
    contact: "Contact",
    address: "Residential address",
    security: "Security",
    firstName: "First name",
    lastName: "Last name",
    middleName: "Middle name (optional)",
    dateOfBirth: "Date of birth",
    username: "Username",
    accountType: "Account type",
    primaryCurrency: "Primary currency",
    email: "Email address",
    country: "Country of residence",
    phone: "Phone number",
    preferredLanguage: "Preferred language",
    streetAddress: "Street address",
    city: "City",
    postalCode: "Postal / ZIP code",
    region: "State / Province (optional)",
    alreadyHaveAccount: "Already have an account?",
  },
  ui: uiResource,
} as const;

export type TranslationResource = typeof englishResource;

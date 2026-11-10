declare module "*.css";

declare module "langmap" {
  export type LanguageMapEntry = {
    englishName: string;
    nativeName: string;
  };

  const languageMap: Record<string, LanguageMapEntry>;
  export = languageMap;
}

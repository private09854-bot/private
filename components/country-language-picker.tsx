"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import Select, { type StylesConfig } from "react-select";
import { COUNTRIES } from "@/lib/countries";
import { languagesForCountry, type CountryLanguageOption } from "@/lib/languages";

type CountryOption = { value: string; label: string };
type Option = CountryOption | CountryLanguageOption;

const countryOptions: CountryOption[] = COUNTRIES.map((country) => ({
  value: country.code,
  label: `${country.flag} ${country.name}`,
}));

const selectStyles: StylesConfig<Option, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderColor: state.isFocused ? "#10b981" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
    ":hover": { borderColor: "#10b981" },
  }),
  menu: (base) => ({ ...base, zIndex: 1001 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#059669" : state.isFocused ? "#ecfdf5" : "white",
    color: state.isSelected ? "white" : "#0f172a",
  }),
};

/** A global country → language browser backed entirely by the installed datasets. */
export default function CountryLanguagePicker() {
  const [countryCode, setCountryCode] = useState("US");
  const [selectedLanguage, setSelectedLanguage] = useState<CountryLanguageOption | null>(null);
  const languageOptions = languagesForCountry(countryCode);

  function changeCountry(next: CountryOption | null) {
    const nextCode = next?.value ?? "";
    setCountryCode(nextCode);
    setSelectedLanguage(null);
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[1000] w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">
        <Languages className="size-4 text-emerald-600" aria-hidden="true" />
        Country & language
      </div>
      <div className="flex flex-col gap-2">
        <Select<CountryOption, false>
          inputId="global-country-language-country"
          aria-label="Choose country"
          options={countryOptions}
          value={countryOptions.find((option) => option.value === countryCode) ?? null}
          onChange={changeCountry}
          placeholder="Search country"
          isSearchable
          styles={selectStyles}
        />
        <Select<CountryLanguageOption, false>
          inputId="global-country-language-language"
          aria-label="Choose language"
          options={languageOptions}
          value={selectedLanguage}
          onChange={setSelectedLanguage}
          placeholder={languageOptions.length ? "Search language" : "No language data for this country"}
          noOptionsMessage={() => "No matching languages found"}
          isSearchable
          isClearable
          isDisabled={!languageOptions.length}
          filterOption={(candidate, input) =>
            candidate.data.searchText.includes(input.toLocaleLowerCase())
          }
          formatOptionLabel={(option) => (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm">{option.nativeName}</span>
              <span className="truncate text-xs text-slate-500">{option.englishName}</span>
            </span>
          )}
          getOptionLabel={(option) => `${option.nativeName} — ${option.englishName}`}
          styles={selectStyles}
        />
      </div>
    </aside>
  );
}

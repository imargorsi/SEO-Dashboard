import { allCountries } from "country-telephone-data";

export type TCountryDialCode = {
  /** ISO 3166-1 alpha-2 code, uppercased; lowercased form matches a `flag-icons` `fi-xx` class. */
  code: string;
  name: string;
  dialCode: string;
};

/** GCC/MENA first since most of our clients are based there, then alphabetical. */
const PRIORITY_ISO2 = ["sa", "ae", "kw", "qa", "bh", "om", "eg", "jo", "lb", "iq", "ye"];

function stripNativeName(name: string) {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export const COUNTRY_DIAL_CODES: TCountryDialCode[] = allCountries
  .map((country) => ({
    code: country.iso2.toUpperCase(),
    name: stripNativeName(country.name),
    dialCode: `+${country.dialCode}`,
  }))
  .sort((a, b) => {
    const aPriority = PRIORITY_ISO2.indexOf(a.code.toLowerCase());
    const bPriority = PRIORITY_ISO2.indexOf(b.code.toLowerCase());
    if (aPriority !== -1 || bPriority !== -1) {
      return (aPriority === -1 ? PRIORITY_ISO2.length : aPriority) - (bPriority === -1 ? PRIORITY_ISO2.length : bPriority);
    }
    return a.name.localeCompare(b.name);
  });

export const DEFAULT_COUNTRY_DIAL_CODE =
  COUNTRY_DIAL_CODES.find((country) => country.code === "SA") ?? COUNTRY_DIAL_CODES[0];

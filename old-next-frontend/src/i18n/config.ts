import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import ar from "../locales/ar.ts"
import en from "../locales/en.ts"

const RTL = new Set(["ar", "he", "fa", "ur"])

function applyDirLang(lng: string) {
  const base = lng.split(/[-_]/)[0] ?? "en"
  const dir: "rtl" | "ltr" = RTL.has(base) ? "rtl" : "ltr"
  document.documentElement.lang = lng
  document.documentElement.dir = dir
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  })
  .then(() => {
    applyDirLang(i18n.resolvedLanguage ?? "en")
  })

i18n.on("languageChanged", applyDirLang)

export { applyDirLang, i18n }

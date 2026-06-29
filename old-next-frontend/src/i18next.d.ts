import "i18next"
import type { Translation } from "./locales/en.ts"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: {
      translation: Translation
    }
    returnNull: false
    returnObjects: false
    strictKeyChecks: false
    enableSelector: false
  }
}

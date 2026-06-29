import type { CreateCompanyFormValues } from "@/components/forms/createCompanyForm.types"
import type { CompanyTableRow } from "@/components/table/CompaniesTable"

export type CompaniesEditLocationState = {
  company: CompanyTableRow
}

export type CompaniesListLocationState = {
  feedback?: {
    variant: "default" | "destructive"
    title: string
    description: string
  }
}

export function companyRowToFormValues(row: CompanyTableRow): CreateCompanyFormValues {
  return {
    company_name: row.name,
    poc_name: row.pocName?.trim() ?? "",
    poc_email: row.pocEmail?.trim() ?? "",
    status_active: row.statusActive,
  }
}

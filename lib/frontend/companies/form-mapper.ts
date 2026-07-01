import type { CompanyTableRow } from "@/components/table/companies-table";
import type { CreateCompanyFormValues } from "@/components/forms/create-company-form.types";

export function companyRowToFormValues(row: CompanyTableRow): CreateCompanyFormValues {
  return {
    company_name: row.name,
    poc_name: row.pocName?.trim() ?? "",
    poc_email: row.pocEmail?.trim() ?? "",
    status_active: row.statusActive,
  };
}

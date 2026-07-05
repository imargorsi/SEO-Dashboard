"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { CreateCompanyForm } from "@/components/forms/create-company-form";
import { Spinner } from "@/components/ui/spinner";
import { useCompanyQuery } from "@/features/companies/companies.api";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { companyCanCreate, companyCanUpdate } from "@/lib/frontend/companies/acl";
import { companyRowToFormValues } from "@/lib/frontend/companies/form-mapper";

type CompaniesFormSectionProps = {
  companyId?: string;
};

export function CompaniesFormSection({ companyId }: CompaniesFormSectionProps) {
  const router = useRouter();
  const { data: authUser } = useAuthUserQuery();

  const isEdit = Boolean(companyId);

  const { canCreate, canUpdate } = useMemo(() => {
    const p = authUser?.permissions ?? [];
    return {
      canCreate: companyCanCreate(p),
      canUpdate: companyCanUpdate(p),
    };
  }, [authUser]);

  const { data: company, isLoading, error } = useCompanyQuery(companyId);

  useEffect(() => {
    if (isEdit && !canUpdate) router.replace("/companies");
    if (!isEdit && !canCreate) router.replace("/companies");
  }, [isEdit, canCreate, canUpdate, router]);

  useEffect(() => {
    if (!isEdit || isLoading) return;
    if (error || !company) router.replace("/companies");
  }, [company, error, isEdit, isLoading, router]);

  if ((!isEdit && !canCreate) || (isEdit && !canUpdate)) return null;

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isEdit && !company) return null;

  const initialValues = company
    ? companyRowToFormValues({
        id: company.id,
        name: company.name,
        pocName: company.poc_name,
        pocEmail: company.poc_email,
        statusActive: company.is_active ?? true,
        registrationStatus: company.status === "approved" ? "approved" : "pending",
      })
    : undefined;

  return (
    <div className="w-full min-w-0">
      <div className="w-full px-4 py-6 sm:px-6">
        <CreateCompanyForm companyId={companyId} initialValues={initialValues} />
      </div>
    </div>
  );
}

import { CompaniesFormSection } from "@/sections/companies-form-section";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompaniesEditPage({ params }: PageProps) {
  const { id } = await params;
  return <CompaniesFormSection companyId={id} />;
}

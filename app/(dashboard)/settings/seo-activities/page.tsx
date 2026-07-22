import { redirect } from "next/navigation";

/** Nested SEO Activities settings moved into the Settings categories panel. */
export default function SeoActivitiesSettingsRedirectPage() {
  redirect("/settings");
}

import { getMostRecentJobListing } from "@/data-layer/job-listings";
import { getCurrentOrganization } from "@/services/clerk/get-current-auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Employer" };

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
}

async function SuspendedPage() {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return null;

  const jobListing = await getMostRecentJobListing(orgId);
  if (jobListing == null) {
    redirect("/employer/job-listings/new");
  } else {
    redirect(`/employer/job-listings/${jobListing.id}`);
  }
}

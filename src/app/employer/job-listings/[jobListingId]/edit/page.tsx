import { JobListingForm } from "@/components/job-listings/job-listing-form";
import { Card, CardContent } from "@/components/ui/card";
import { getJobListing } from "@/data-layer/job-listings";
import { getCurrentOrganization } from "@/services/clerk/get-current-auth";

import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ jobListingId: string }>;
};

export default function EditJobListingPage(props: Props) {
  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="mb-2 text-2xl font-bold">Edit Job Listing</h1>
      <Card>
        <CardContent>
          <Suspense>
            <SuspendedPage {...props} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedPage({ params }: Props) {
  const { jobListingId } = await params;
  const { orgId } = await getCurrentOrganization();

  if (orgId == null) return notFound();

  const jobListing = await getJobListing(jobListingId, orgId);
  if (jobListing == null) return notFound();

  return <JobListingForm jobListing={jobListing} />;
}

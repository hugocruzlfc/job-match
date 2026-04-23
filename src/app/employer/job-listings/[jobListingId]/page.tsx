import {
  deleteJobListing,
  toggleJobListingFeatured,
  toggleJobListingStatus,
} from "@/actions/job-listing-actions";
import { ActionButton } from "@/components/actions-button";
import { AsyncIf } from "@/components/aync-if";

import { JobListingBadges } from "@/components/job-listings/job-listing.badges";
import { MarkdownPartial } from "@/components/markdown/markdown-partial";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  getJobListing,
  getJobListingApplications,
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "@/data-layer/job-listings";
import { JobListingStatus } from "@/drizzle/schema";
import { formatJobListingStatus, getNextJobListingStatus } from "@/lib/utils";
import { getCurrentOrganization } from "@/services/clerk/get-current-auth";
import { hasOrgUserPermission } from "@/services/clerk/org-user-permissions";
import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

type Props = {
  params: Promise<{ jobListingId: string }>;
};

export default function JobListingPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}

async function SuspendedPage({ params }: Props) {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return null;

  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);

  if (jobListing == null) return notFound();

  return (
    <div className="@container mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt-4">
          <AsyncIf
            condition={() => hasOrgUserPermission("org:job_listings:update")}
          >
            <Button asChild variant="outline">
              <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
                <EditIcon className="size-4" />
                Edit
              </Link>
            </Button>
          </AsyncIf>
          <StatusUpdateButton status={jobListing.status} id={jobListing.id} />
          {jobListing.status === "published" && (
            <FeaturedToggleButton
              isFeatured={jobListing.isFeatured}
              id={jobListing.id}
            />
          )}
          <AsyncIf
            condition={() => hasOrgUserPermission("org:job_listings:delete")}
          >
            <ActionButton
              variant="destructive"
              action={deleteJobListing.bind(null, jobListing.id)}
              requireAreYouSure
            >
              <Trash2Icon className="size-4" />
              Delete
            </ActionButton>
          </AsyncIf>
        </div>{" "}
        *
      </div>
      <MarkdownPartial
        dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
        mainMarkdown={
          <MarkdownRenderer
            className="prose-sm"
            source={jobListing.description}
          />
        }
        dialogTitle="Description"
      />

      <Separator />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Applications</h2>
        {/* <Suspense fallback={<SkeletonJobListingApplicationTable />}>
          <Applications jobListingId={jobListingId} />
        </Suspense> */}
      </div>
    </div>
  );
}

function StatusUpdateButton({
  status,
  id,
}: {
  status: JobListingStatus;
  id: string;
}) {
  const button = (
    <ActionButton
      action={toggleJobListingStatus.bind(null, id)}
      variant="outline"
      requireAreYouSure={getNextJobListingStatus(status) === "published"}
      areYouSureDescription="This will immediately show this job listing to all users."
    >
      {statusToggleButtonText(status)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("org:job_listings:change_status")}
    >
      {getNextJobListingStatus(status) === "published" ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxPublishedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={statusToggleButtonText(status)}
              popoverText="You must upgrade your plan to publish more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      ) : (
        button
      )}
    </AsyncIf>
  );
}

function FeaturedToggleButton({
  isFeatured,
  id,
}: {
  isFeatured: boolean;
  id: string;
}) {
  const button = (
    <ActionButton
      action={toggleJobListingFeatured.bind(null, id)}
      variant="outline"
    >
      {featuredToggleButtonText(isFeatured)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("org:job_listings:change_status")}
    >
      {isFeatured ? (
        button
      ) : (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={featuredToggleButtonText(isFeatured)}
              popoverText="You must upgrade your plan to feature more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      )}
    </AsyncIf>
  );
}

function UpgradePopover({
  buttonText,
  popoverText,
}: {
  buttonText: ReactNode;
  popoverText: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {popoverText}
        <Button asChild>
          <Link href="/employer/pricing">Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function statusToggleButtonText(status: JobListingStatus) {
  switch (status) {
    case "delisted":
    case "draft":
      return (
        <>
          <EyeIcon className="size-4" />
          Publish
        </>
      );
    case "published":
      return (
        <>
          <EyeOffIcon className="size-4" />
          Delist
        </>
      );
    default:
      throw new Error(`Unknown status: ${status satisfies never}`);
  }
}

function featuredToggleButtonText(isFeatured: boolean) {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className="size-4" />
        UnFeature
      </>
    );
  }

  return (
    <>
      <StarIcon className="size-4" />
      Feature
    </>
  );
}

async function Applications({ jobListingId }: { jobListingId: string }) {
  const applications = await getJobListingApplications(jobListingId);

  return <div>Applications</div>;
  // <JobListingApplicationTable
  //   applications={applications.map((a) => ({
  //     ...a,
  //     user: {
  //       ...a.user,
  //       resume: a.user.resume
  //         ? {
  //             ...a.user.resume,
  //             markdownSummary: a.user.resume.aiSummary ? (
  //               <MarkdownRenderer source={a.user.resume.aiSummary} />
  //             ) : null,
  //           }
  //         : null,
  //     },
  //     coverLetterMarkdown: a.coverLetter ? (
  //       <MarkdownRenderer source={a.coverLetter} />
  //     ) : null,
  //   }))}
  //   canUpdateRating={await hasOrgUserPermission(
  //     "org:job_listing_applications:change_rating",
  //   )}
  //   canUpdateStage={await hasOrgUserPermission(
  //     "org:job_listing_applications:change_stage",
  //   )}
  // />
}

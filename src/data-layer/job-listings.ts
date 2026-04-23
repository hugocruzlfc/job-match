import { db } from "@/drizzle/db";
import { JobListingApplicationTable, JobListingTable } from "@/drizzle/schema";
import { getCurrentOrganization } from "@/services/clerk/get-current-auth";
import { hasPlanFeature } from "@/services/clerk/plan-features";
import { and, count, desc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import {
  getJobListingApplicationJobListingTag,
  getJobListingIdTag,
  getJobListingOrganizationTag,
  getUserIdTag,
  getUserResumeIdTag,
  revalidateJobListingCache,
} from "./cache";

export async function getJobListings(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const data = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: count(JobListingApplicationTable.userId),
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .leftJoin(
      JobListingApplicationTable,
      eq(JobListingTable.id, JobListingApplicationTable.jobListingId),
    )
    .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
    .orderBy(desc(JobListingTable.createdAt));

  data.forEach((jobListing) => {
    cacheTag(getJobListingApplicationJobListingTag(jobListing.id));
  });

  return data;
}

export async function getMostRecentJobListing(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  return db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.organizationId, orgId),
    orderBy: desc(JobListingTable.createdAt),
    columns: { id: true },
  });
}

export async function getJobListing(id: string, orgId: string) {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId),
    ),
  });
}

export async function hasReachedMaxPublishedJobListings() {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return true;

  const count = await getPublishedJobListingsCount(orgId);

  const canPost = await Promise.all([
    hasPlanFeature("post_1_job_listing").then((has) => has && count < 1),
    hasPlanFeature("post_3_job_listings").then((has) => has && count < 3),
    hasPlanFeature("post_15_job_listings").then((has) => has && count < 15),
  ]);

  return !canPost.some(Boolean);
}

export async function hasReachedMaxFeaturedJobListings() {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return true;

  const count = await getFeaturedJobListingsCount(orgId);

  const canFeature = await Promise.all([
    hasPlanFeature("1_featured_job_listing").then((has) => has && count < 1),
    hasPlanFeature("unlimited_featured_jobs_listings"),
  ]);

  return !canFeature.some(Boolean);
}

async function getPublishedJobListingsCount(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(
      and(
        eq(JobListingTable.organizationId, orgId),
        eq(JobListingTable.status, "published"),
      ),
    );
  return res?.count ?? 0;
}

async function getFeaturedJobListingsCount(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(
      and(
        eq(JobListingTable.organizationId, orgId),
        eq(JobListingTable.isFeatured, true),
      ),
    );
  return res?.count ?? 0;
}

export async function insertJobListing(
  jobListing: typeof JobListingTable.$inferInsert,
) {
  const [newListing] = await db
    .insert(JobListingTable)
    .values(jobListing)
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });

  revalidateJobListingCache(newListing);

  return newListing;
}

export async function updateJobListing(
  id: string,
  jobListing: Partial<typeof JobListingTable.$inferInsert>,
) {
  const [updatedListing] = await db
    .update(JobListingTable)
    .set(jobListing)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });

  revalidateJobListingCache(updatedListing);

  return updatedListing;
}

export async function deleteJobListing(id: string) {
  const [deletedJobListing] = await db
    .delete(JobListingTable)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });

  revalidateJobListingCache(deletedJobListing);

  return deletedJobListing;
}

export async function getJobListingApplications(jobListingId: string) {
  "use cache";
  cacheTag(getJobListingApplicationJobListingTag(jobListingId));

  const data = await db.query.JobListingApplicationTable.findMany({
    where: eq(JobListingApplicationTable.jobListingId, jobListingId),
    columns: {
      coverLetter: true,
      createdAt: true,
      stage: true,
      rating: true,
      jobListingId: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
        with: {
          resume: {
            columns: {
              resumeFileUrl: true,
              aiSummary: true,
            },
          },
        },
      },
    },
  });

  data.forEach(({ user }) => {
    cacheTag(getUserIdTag(user.id));
    cacheTag(getUserResumeIdTag(user.id));
  });

  return data;
}

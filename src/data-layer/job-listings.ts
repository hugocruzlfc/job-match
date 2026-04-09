import { db } from "@/drizzle/db";
import { JobListingApplicationTable, JobListingTable } from "@/drizzle/schema";
import { count, desc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import {
  getJobListingApplicationJobListingTag,
  getJobListingOrganizationTag,
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

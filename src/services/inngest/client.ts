import { eventType, Inngest, staticSchema } from "inngest";

import { JobListingApplicationTable, JobListingTable } from "@/drizzle/schema";
import {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
} from "@clerk/nextjs/server";

type ClerkWebhookData<T> = {
  data: {
    data: T;
    raw: string;
    headers: Record<string, string>;
  };
};

// Event type definitions
export const clerkUserCreated = eventType("clerk/user.created", {
  schema: staticSchema<ClerkWebhookData<UserJSON>>(),
});

export const clerkUserUpdated = eventType("clerk/user.updated", {
  schema: staticSchema<ClerkWebhookData<UserJSON>>(),
});

export const clerkUserDeleted = eventType("clerk/user.deleted", {
  schema: staticSchema<ClerkWebhookData<DeletedObjectJSON>>(),
});

export const clerkOrganizationCreated = eventType(
  "clerk/organization.created",
  {
    schema: staticSchema<ClerkWebhookData<OrganizationJSON>>(),
  },
);

export const clerkOrganizationUpdated = eventType(
  "clerk/organization.updated",
  {
    schema: staticSchema<ClerkWebhookData<OrganizationJSON>>(),
  },
);

export const clerkOrganizationDeleted = eventType(
  "clerk/organization.deleted",
  {
    schema: staticSchema<ClerkWebhookData<DeletedObjectJSON>>(),
  },
);

export const clerkOrganizationMembershipCreated = eventType(
  "clerk/organizationMembership.created",
  {
    schema: staticSchema<ClerkWebhookData<OrganizationMembershipJSON>>(),
  },
);

export const clerkOrganizationMembershipDeleted = eventType(
  "clerk/organizationMembership.deleted",
  {
    schema: staticSchema<ClerkWebhookData<OrganizationMembershipJSON>>(),
  },
);

export const jobListingApplicationCreated = eventType(
  "app/jobListingApplication.created",
  {
    schema: staticSchema<{
      data: {
        jobListingId: string;
        userId: string;
      };
    }>(),
  },
);

export const resumeUploaded = eventType("app/resume.uploaded", {
  schema: staticSchema<{
    user: {
      id: string;
    };
  }>(),
});

export const emailDailyUserJobListings = eventType(
  "app/email.daily-user-job-listings",
  {
    schema: staticSchema<{
      data: {
        aiPrompt?: string;
        jobListings: (Omit<
          typeof JobListingTable.$inferSelect,
          "createdAt" | "postedAt" | "updatedAt" | "status" | "organizationId"
        > & { organizationName: string })[];
      };
      user: {
        email: string;
        name: string;
      };
    }>(),
  },
);

export const emailDailyOrganizationUserApplications = eventType(
  "app/email.daily-organization-user-applications",
  {
    schema: staticSchema<{
      data: {
        applications: (Pick<
          typeof JobListingApplicationTable.$inferSelect,
          "rating"
        > & {
          userName: string;
          organizationId: string;
          organizationName: string;
          jobListingId: string;
          jobListingTitle: string;
        })[];
      };
      user: {
        email: string;
        name: string;
      };
    }>(),
  },
);

export const inngest = new Inngest({
  id: "job-match",
  isDev: process.env.NODE_ENV === "development",
  checkpointing: {
    // Set maxRuntime to ~80% of Vercel's function timeout (300s)
    maxRuntime: "240s",
  },
});

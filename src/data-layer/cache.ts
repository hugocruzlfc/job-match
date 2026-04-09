import {
  getGlobalTag,
  getIdTag,
  getJobListingTag,
  getOrganizationTag,
} from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

/// User cache tags

export function getUserGlobalTag() {
  return getGlobalTag("users");
}

export function getUserIdTag(id: string) {
  return getIdTag("users", id);
}

export function revalidateUserCache(id: string) {
  revalidateTag(getUserGlobalTag(), "max");
  revalidateTag(getUserIdTag(id), "max");
}

/// User Notification Settings cache tags

export function getUserNotificationSettingsGlobalTag() {
  return getGlobalTag("userNotificationSettings");
}

export function getUserNotificationSettingsIdTag(userId: string) {
  return getIdTag("userNotificationSettings", userId);
}

export function revalidateUserNotificationSettingsCache(userId: string) {
  revalidateTag(getUserNotificationSettingsGlobalTag(), "max");
  revalidateTag(getUserNotificationSettingsIdTag(userId), "max");
}

/// Organization User Settings cache tags

export function getOrganizationUserSettingsGlobalTag() {
  return getGlobalTag("organizationUserSettings");
}

export function getOrganizationUserSettingsIdTag({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  return getIdTag("organizationUserSettings", `${organizationId}-${userId}`);
}

export function revalidateOrganizationUserSettingsCache(id: {
  organizationId: string;
  userId: string;
}) {
  revalidateTag(getOrganizationUserSettingsGlobalTag(), "max");
  revalidateTag(getOrganizationUserSettingsIdTag(id), "max");
}

export function getOrganizationGlobalTag() {
  return getGlobalTag("organizations");
}

export function getOrganizationIdTag(id: string) {
  return getIdTag("organizations", id);
}

export function revalidateOrganizationCache(id: string) {
  revalidateTag(getOrganizationGlobalTag(), "max");
  revalidateTag(getOrganizationIdTag(id), "max");
}

///Job Listing Applications cache tags

export function getJobListingApplicationGlobalTag() {
  return getGlobalTag("jobListingApplications");
}

export function getJobListingApplicationJobListingTag(jobListingId: string) {
  return getJobListingTag("jobListingApplications", jobListingId);
}

export function getJobListingApplicationIdTag({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) {
  return getIdTag("jobListingApplications", `${jobListingId}-${userId}`);
}

export function revalidateJobListingApplicationCache(id: {
  userId: string;
  jobListingId: string;
}) {
  revalidateTag(getJobListingApplicationGlobalTag(), "max");
  revalidateTag(getJobListingApplicationJobListingTag(id.jobListingId), "max");
  revalidateTag(getJobListingApplicationIdTag(id), "max");
}

///Job Listings cache tags

export function getJobListingGlobalTag() {
  return getGlobalTag("jobListings");
}

export function getJobListingOrganizationTag(organizationId: string) {
  return getOrganizationTag("jobListings", organizationId);
}

export function getJobListingIdTag(id: string) {
  return getIdTag("jobListings", id);
}

export function revalidateJobListingCache({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  revalidateTag(getJobListingGlobalTag(), "max");
  revalidateTag(getJobListingOrganizationTag(organizationId), "max");
  revalidateTag(getJobListingIdTag(id), "max");
}

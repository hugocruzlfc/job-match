import { getGlobalTag, getIdTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

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

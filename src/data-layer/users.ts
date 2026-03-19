import { db } from "@/drizzle/db";
import { UserNotificationSettingsTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import {
  revalidateUserCache,
  revalidateUserNotificationSettingsCache,
} from "./cache";

export async function insertUser(user: typeof UserTable.$inferInsert) {
  await db.insert(UserTable).values(user).onConflictDoNothing();

  revalidateUserCache(user.id);
}

export async function updateUser(
  id: string,
  user: Partial<typeof UserTable.$inferInsert>,
) {
  await db.update(UserTable).set(user).where(eq(UserTable.id, id));

  revalidateUserCache(id);
}

export async function deleteUser(id: string) {
  await db.delete(UserTable).where(eq(UserTable.id, id));

  revalidateUserCache(id);
}

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert,
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();

  revalidateUserNotificationSettingsCache(settings.userId);
}

export async function updateUserNotificationSettings(
  userId: string,
  settings: Partial<
    Omit<typeof UserNotificationSettingsTable.$inferInsert, "userId">
  >,
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values({ ...settings, userId })
    .onConflictDoUpdate({
      target: UserNotificationSettingsTable.userId,
      set: settings,
    });

  revalidateUserNotificationSettingsCache(userId);
}

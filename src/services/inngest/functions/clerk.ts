import {
  deleteOrganization,
  insertOrganization,
  updateOrganization,
} from "@/data-layer/organizations";
import {
  deleteOrganizationUserSettings,
  insertOrganizationUserSettings,
} from "@/data-layer/organizations-user-settings";
import {
  deleteUser,
  insertUser,
  insertUserNotificationSettings,
  updateUser,
} from "@/data-layer/users";
import { env } from "@/env/server";
import { NonRetriableError } from "inngest";
import { Webhook } from "svix";
import {
  clerkOrganizationCreated,
  clerkOrganizationDeleted,
  clerkOrganizationMembershipCreated,
  clerkOrganizationMembershipDeleted,
  clerkOrganizationUpdated,
  clerkUserCreated,
  clerkUserDeleted,
  clerkUserUpdated,
  inngest,
} from "../client";

const clerkSvixHeaderNames = [
  "svix-id",
  "svix-timestamp",
  "svix-signature",
] as const;

/**
 * Verifica la firma del webhook de Clerk usando la librería svix
 * @param raw - El cuerpo raw del webhook como string
 * @param headers - Los headers del webhook incluyendo la firma de Svix
 */
function verifyClerkWebhook({
  raw,
  headers,
}: {
  raw: string;
  headers: Record<string, string> | undefined;
}) {
  const processedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (value == null) continue;
    processedHeaders[key.toLowerCase()] = String(value);
  }

  const svixHeaders = Object.fromEntries(
    clerkSvixHeaderNames
      .map((headerName) => [headerName, processedHeaders[headerName]])
      .filter((entry): entry is [string, string] => entry[1] != null),
  );

  const missingHeaders = clerkSvixHeaderNames.filter(
    (headerName) => svixHeaders[headerName] == null,
  );

  if (missingHeaders.length > 0) {
    throw new NonRetriableError(
      `Missing Clerk Svix headers: ${missingHeaders.join(", ")}`,
    );
  }

  return new Webhook(env.CLERK_WEBHOOK_SECRET).verify(raw, svixHeaders);
}

async function runClerkWebhookVerification(
  step: { run: (id: string, fn: () => Promise<unknown>) => Promise<unknown> },
  eventData: {
    raw: string;
    headers: Record<string, string> | undefined;
  },
) {
  await step.run("verify-webhook", async () => {
    try {
      verifyClerkWebhook(eventData);
    } catch (error) {
      if (error instanceof NonRetriableError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Unknown Clerk webhook error";

      throw new NonRetriableError(`Invalid webhook signature: ${message}`);
    }
  });
}

// User Created, Updated, Deleted - Sync with DB

export const clerkCreateUser = inngest.createFunction(
  {
    id: "clerk/create-db-user",
    name: "Create Clerk User",
    triggers: [clerkUserCreated],
  },
  async ({ event, step }) => {
    await runClerkWebhookVerification(step, event.data);

    const userId = await step.run("create-user", async () => {
      // Los datos del usuario de Clerk están en event.data.data
      const userData = event.data.data;

      // Buscar el email primario del usuario
      const email =
        userData.email_addresses.find(
          (email: any) => email.id === userData.primary_email_address_id,
        ) || null;

      if (email === null) {
        throw new NonRetriableError("No primary email address found for user");
      }

      // Crear el usuario en nuestra base de datos
      await insertUser({
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        imageUrl: userData.image_url,
        email: email.email_address,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      });

      return userData.id;
    });

    await step.run("create-user-notifications-settings", async () => {
      await insertUserNotificationSettings({ userId });
    });
  },
);

export const clerkDeleteUser = inngest.createFunction(
  {
    id: "clerk/delete-db-user",
    name: "Clerk - Delete DB User",
    triggers: [clerkUserDeleted],
  },
  async ({ event, step }) => {
    await runClerkWebhookVerification(step, event.data);

    await step.run("delete-user", async () => {
      const { id } = event.data.data;

      if (id == null) {
        throw new NonRetriableError("No id found");
      }
      await deleteUser(id);
    });
  },
);

export const clerkUpdateUser = inngest.createFunction(
  {
    id: "clerk/update-db-user",
    name: "Clerk - Update DB User",
    triggers: [clerkUserUpdated],
  },
  async ({ event, step }) => {
    await runClerkWebhookVerification(step, event.data);

    await step.run("update-user", async () => {
      const userData = event.data.data;
      const email = userData.email_addresses.find(
        (email) => email.id === userData.primary_email_address_id,
      );

      if (email == null) {
        throw new NonRetriableError("No primary email address found");
      }

      await updateUser(userData.id, {
        name: `${userData.first_name} ${userData.last_name}`,
        imageUrl: userData.image_url,
        email: email.email_address,
        updatedAt: new Date(userData.updated_at),
      });
    });
  },
);

/**********Organization Functions **********/

export const clerkCreateOrganization = inngest.createFunction(
  {
    id: "clerk/create-db-organization",
    name: "Clerk - Create DB Organization",
    triggers: [clerkOrganizationCreated],
  },

  async ({ event, step }) => {
    await runClerkWebhookVerification(step, event.data);

    await step.run("create-organization", async () => {
      const orgData = event.data.data;

      await insertOrganization({
        id: orgData.id,
        name: orgData.name,
        imageUrl: orgData.image_url,
        createdAt: new Date(orgData.created_at),
        updatedAt: new Date(orgData.updated_at),
      });
    });
  },
);

export const clerkUpdateOrganization = inngest.createFunction(
  {
    id: "clerk/update-db-organization",
    name: "Clerk - Update DB Organization",
    triggers: [clerkOrganizationUpdated],
  },

  async ({ event, step }) => {
    await runClerkWebhookVerification(step, event.data);

    await step.run("update-organization", async () => {
      const orgData = event.data.data;

      await updateOrganization(orgData.id, {
        name: orgData.name,
        imageUrl: orgData.image_url,
        updatedAt: new Date(orgData.updated_at),
      });
    });
  },
);

export const clerkDeleteOrganization = inngest.createFunction(
  {
    id: "clerk/delete-db-organization",
    name: "Clerk - Delete DB Organization",
    triggers: [clerkOrganizationDeleted],
  },
  async ({ event, step }) => {
    await runClerkWebhookVerification(step, event.data);

    await step.run("delete-organization", async () => {
      const { id } = event.data.data;

      if (id == null) {
        throw new NonRetriableError("No id found");
      }
      await deleteOrganization(id);
    });
  },
);

export const clerkCreateOrgMembership = inngest.createFunction(
  {
    id: "clerk/create-organization-user-settings",
    name: "Clerk - Create Organization User Settings",
    triggers: [clerkOrganizationMembershipCreated],
  },
  async ({ event, step }) => {
    await runClerkWebhookVerification(step, event.data);

    await step.run("create-organization-user-settings", async () => {
      const userId = event.data.data.public_user_data.user_id;
      const orgId = event.data.data.organization.id;

      await insertOrganizationUserSettings({
        userId,
        organizationId: orgId,
      });
    });
  },
);

export const clerkDeleteOrgMembership = inngest.createFunction(
  {
    id: "clerk/delete-organization-user-settings",
    name: "Clerk - Delete Organization User Settings",
    triggers: [clerkOrganizationMembershipDeleted],
  },
  async ({ event, step }) => {
    await runClerkWebhookVerification(step, event.data);

    await step.run("delete-organization-user-settings", async () => {
      const userId = event.data.data.public_user_data.user_id;
      const orgId = event.data.data.organization.id;

      await deleteOrganizationUserSettings({
        userId,
        organizationId: orgId,
      });
    });
  },
);

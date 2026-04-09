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
  clerkUserCreated,
  clerkUserDeleted,
  clerkUserUpdated,
  inngest,
} from "../client";

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
  // Asegurarse de que headers sea un objeto válido
  const validHeaders = headers || {};

  // Convertir headers a strings si no lo están ya (por compatibilidad)
  const processedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(validHeaders)) {
    processedHeaders[key] = String(value);
  }

  return new Webhook(env.CLERK_WEBHOOK_SECRET).verify(raw, processedHeaders);
}

export const clerkCreateUser = inngest.createFunction(
  {
    id: "clerk/create-db-user",
    name: "Create Clerk User",
    triggers: [clerkUserCreated],
  },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      // En desarrollo, podemos saltarnos la verificación si hay problemas

      try {
        verifyClerkWebhook({
          raw: event.data.raw,
          headers: event.data.headers,
        });
      } catch (error) {
        throw new Error("Invalid webhook signature");
      }
    });

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
    await step.run("verify-webhook", async () => {
      try {
        verifyClerkWebhook({
          raw: event.data.raw,
          headers: event.data.headers,
        });
      } catch (error) {
        throw new Error("Invalid webhook signature");
      }
    });

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
    await step.run("verify-webhook", async () => {
      try {
        verifyClerkWebhook({
          raw: event.data.raw,
          headers: event.data.headers,
        });
      } catch (error) {
        throw new Error("Invalid webhook signature");
      }
    });

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

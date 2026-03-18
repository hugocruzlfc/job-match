import { insertUser } from "@/data-layer/users/db";
import { env } from "@/env/server";
import { NonRetriableError } from "inngest";
import { Webhook } from "svix";
import { clerkUserCreated, inngest } from "../client";

function verifyClerkWebhook({
  raw,
  headers,
}: {
  raw: string;
  headers: Record<string, string>;
}) {
  return new Webhook(env.CLERK_SECRET_KEY).verify(raw, headers);
}

export const clerkCreateUser = inngest.createFunction(
  {
    id: "clerk/create-db-user",
    name: "Create Clerk User",
    triggers: [clerkUserCreated],
  },
  async ({ event, step }) => {
    await step.run("Verify Clerk Webhook", async () => {
      try {
        verifyClerkWebhook({
          raw: event.data.data.raw,
          headers: event.data.data.headers,
        });
      } catch (error) {
        console.error("Failed to verify Clerk webhook:", error);
        throw new Error("Invalid webhook signature");
      }
    });

    const userId = await step.run("Create User", async () => {
      const userData = event.data.data.data;
      const email =
        userData.email_addresses.find(
          (email) => email.id === userData.primary_email_address_id,
        ) || null;

      if (email === null) {
        throw new NonRetriableError("No primary email address found for user");
      }

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
  },
);

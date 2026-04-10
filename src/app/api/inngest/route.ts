import { inngest } from "@/services/inngest/client";
import {
  clerkCreateOrganization,
  clerkCreateOrgMembership,
  clerkCreateUser,
  clerkDeleteOrganization,
  clerkDeleteOrgMembership,
  clerkDeleteUser,
  clerkUpdateOrganization,
  clerkUpdateUser,
} from "@/services/inngest/functions/clerk";
import { serve } from "inngest/next";

// Create an API that serves our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkUpdateUser,
    clerkDeleteUser,
    clerkCreateOrganization,
    clerkUpdateOrganization,
    clerkDeleteOrganization,
    clerkCreateOrgMembership,
    clerkDeleteOrgMembership,
  ],
  streaming: true,
});

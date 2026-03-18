import { inngest } from "@/services/inngest/client";
import { clerkCreateUser } from "@/services/inngest/functions/clerk";
import { serve } from "inngest/next";

// Configure maxDuration for Vercel
export const maxDuration = 300; // 5 minutes

// Create an API that serves our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [clerkCreateUser],
});

import { getCurrentUser } from "@/services/clerk/get-current-auth";
import { SignOutButton } from "@clerk/nextjs";
import { LogOutIcon } from "lucide-react";
import { Suspense } from "react";
import { SidebarMenuButton } from "../ui/sidebar";
import { SidebarUserButtonClient } from "./sidebar-user-button-client";

export function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
}

async function SidebarUserSuspense() {
  const { user } = await getCurrentUser({ allData: true });

  if (user == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return <SidebarUserButtonClient user={user} />;
}

import { getCurrentUser } from "@/services/clerk/get-current-auth";
import { SignOutButton } from "@clerk/nextjs";
import { LogOutIcon } from "lucide-react";
import { Suspense } from "react";
import { SidebarMenuButton } from "../ui/sidebar";
import { AppSidebarUserButtonClient } from "./app-sidebar-user-button-client";

export function AppSidebarUserButton() {
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

  return <AppSidebarUserButtonClient user={user} />;
}

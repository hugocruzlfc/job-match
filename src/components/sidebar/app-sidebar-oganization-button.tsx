import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/get-current-auth";
import { LogOutIcon } from "lucide-react";
import { Suspense } from "react";
import { SignOutButton } from "../clerk/auth-buttons";
import { AppSidebarOrganizationButtonClient } from "./app-sidebar-oganization-button-client";

export function AppSidebarOrganizationButton() {
  return (
    <Suspense>
      <SidebarOrganizationSuspense />
    </Suspense>
  );
}

async function SidebarOrganizationSuspense() {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrganization({ allData: true }),
  ]);

  if (user == null || organization == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return (
    <AppSidebarOrganizationButtonClient
      user={user}
      organization={organization}
    />
  );
}

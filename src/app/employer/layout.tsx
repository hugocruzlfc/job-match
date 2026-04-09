import { AsyncIf } from "@/components/aync-if";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AppSidebarJobListingMenuGroup } from "@/components/sidebar/app-sidebar-joblisting-menu-group";
import { AppSidebarNavMenuGroup } from "@/components/sidebar/app-sidebar-menu-group";
import { AppSidebarOrganizationButton } from "@/components/sidebar/app-sidebar-oganization-button";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getJobListings } from "@/data-layer/job-listings";
import { JobListingStatus } from "@/drizzle/schema";
import { sortJobListingsByStatus } from "@/lib/utils";
import { getCurrentOrganization } from "@/services/clerk/get-current-auth";
import { hasOrgUserPermission } from "@/services/clerk/org-user-permissions";
import { ClipboardListIcon, Link, PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  );
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return redirect("/organizations/select");

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <AsyncIf
              condition={() => hasOrgUserPermission("org:job_listings:create")}
            >
              <SidebarGroupAction title="Add Job Listing" asChild>
                <Link href="/employer/job-listings/new">
                  <PlusIcon /> <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            </AsyncIf>
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense>
                <JobListingMenu orgId={orgId} />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>
          <AppSidebarNavMenuGroup
            className="mt-auto"
            items={[
              { href: "/", icon: <ClipboardListIcon />, label: "Job Board" },
            ]}
          />
        </>
      }
      footerButton={<AppSidebarOrganizationButton />}
    >
      {children}
    </AppSidebar>
  );
}

async function JobListingMenu({ orgId }: { orgId: string }) {
  const jobListings = await getJobListings(orgId);

  if (
    jobListings.length === 0 &&
    (await hasOrgUserPermission("org:job_listings:create"))
  ) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/employer/job-listings/new">
              <PlusIcon />
              <span>Create your first job listing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return Object.entries(Object.groupBy(jobListings, (j) => j.status))
    .sort(([a], [b]) => {
      return sortJobListingsByStatus(
        a as JobListingStatus,
        b as JobListingStatus,
      );
    })
    .map(([status, jobListings]) => (
      <AppSidebarJobListingMenuGroup
        key={status}
        status={status as JobListingStatus}
        jobListings={jobListings}
      />
    ));
}

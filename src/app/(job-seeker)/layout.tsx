import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AppSidebarNavMenuGroup } from "@/components/sidebar/app-sidebar-menu-group";
import { AppSidebarUserButton } from "@/components/sidebar/app-sidebar-user-buton";
import {
  BrainCircuitIcon,
  ClipboardListIcon,
  LayoutDashboard,
  LogInIcon,
} from "lucide-react";
import { ReactNode } from "react";

export default function JobSeekerLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <AppSidebar
      content={
        <>
          {sidebar}
          <AppSidebarNavMenuGroup
            className="mt-auto"
            items={[
              { href: "/", icon: <ClipboardListIcon />, label: "Job Board" },
              {
                href: "/ai-search",
                icon: <BrainCircuitIcon />,
                label: "AI Search",
              },
              {
                href: "/employer",
                icon: <LayoutDashboard />,
                label: "Employer Dashboard",
                authStatus: "signedIn",
              },
              {
                href: "/sign-in",
                icon: <LogInIcon />,
                label: "Sign In",
                authStatus: "signedOut",
              },
            ]}
          />
        </>
      }
      footerButton={<AppSidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
}

"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "../ui/sidebar";

export default function AppSidebarClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex w-full flex-col">
        <div className="flex items-center gap-1 border-b p-2">
          <SidebarTrigger />
          <span className="text-xl">Job Match</span>
        </div>
        <div className="flex flex-1">{children}</div>
      </div>
    );
  }

  return children;
}

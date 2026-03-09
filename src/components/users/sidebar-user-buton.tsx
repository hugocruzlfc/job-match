import { Suspense } from "react";
import { SidebarUserButtonClient } from "./sidebar-user-button-client";

export function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
}

async function SidebarUserSuspense() {
  //   const { user } = await getCurrentUser({ allData: true });

  //   if (user == null) {
  //     return (
  //       <SignOutButton>
  //         <SidebarMenuButton>
  //           <LogOutIcon />
  //           <span>Log Out</span>
  //         </SidebarMenuButton>
  //       </SignOutButton>
  //     );
  //   }

  return (
    <SidebarUserButtonClient
      user={{
        imageUrl: "",
        email: "hugo.cruz@example.com",
        name: "Hugo Cruz",
      }}
    />
  );
}

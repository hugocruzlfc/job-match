import { OrganizationList } from "@clerk/nextjs";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Organization Select" };

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function OrganizationSelectPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}

async function SuspendedPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  const redirectUrl = redirect ?? "/employer";

  return (
    <OrganizationList
      hidePersonal
      skipInvitationScreen
      afterSelectOrganizationUrl={redirectUrl}
      afterCreateOrganizationUrl={redirectUrl}
    />
  );
}

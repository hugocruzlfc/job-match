import { Show } from "@clerk/nextjs";
import { ReactNode, Suspense } from "react";

export function SignedOut({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <Show when="signed-out">{children}</Show>
    </Suspense>
  );
}

export function SignedIn({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <Show when="signed-in">{children}</Show>
    </Suspense>
  );
}

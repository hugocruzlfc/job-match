import { ReactNode, Suspense } from "react";

type Props = {
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
  condition: () => Promise<boolean>;
};

export function AsyncIf({
  children,
  loadingFallback,
  otherwise,
  condition,
}: Props) {
  return (
    <Suspense fallback={loadingFallback}>
      <SuspendedComponent condition={condition} otherwise={otherwise}>
        {children}
      </SuspendedComponent>
    </Suspense>
  );
}

async function SuspendedComponent({
  children,
  condition,
  otherwise,
}: Omit<Props, "loadingFallback">) {
  return (await condition()) ? children : otherwise;
}

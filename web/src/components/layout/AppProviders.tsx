"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

import { ToastViewport } from "@/components/layout/ToastViewport";
import { createQueryClient } from "@/lib/query/query-client";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props): React.JSX.Element {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastViewport />
    </QueryClientProvider>
  );
}

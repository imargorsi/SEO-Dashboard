"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/frontend/query/get-query-client";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
  { ssr: false },
);

type QueryProviderProps = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  );
}

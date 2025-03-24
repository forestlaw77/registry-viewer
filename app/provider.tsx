"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * Provider component
 *
 * This component sets up the context providers for the application.
 * It includes the QueryClientProvider for React Query, ChakraProvider for Chakra UI,
 * and ThemeProvider for theme management.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The child components to be rendered within the providers.
 * @returns {JSX.Element} The rendered provider component.
 */
export default function Provider({ children }: { children: React.ReactNode }) {
  // Initialize the QueryClient for React Query
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          {children}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

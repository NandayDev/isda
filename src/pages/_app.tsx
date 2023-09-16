import type { AppProps } from "next/app";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import "styles/globals.css";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";

export default function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

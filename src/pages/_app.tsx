import type { AppProps } from "next/app";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "styles/globals.css";
import { QueryClient } from "@tanstack/query-core";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";

const theme = extendTheme({
  components: {
    Button: { defaultProps: { colorScheme: "teal" } },
    Input: { defaultProps: { focusBorderColor: "teal.400" } },
    NumberInput: { defaultProps: { focusBorderColor: "teal.400" } },
    Select: { defaultProps: { focusBorderColor: "teal.400" } },
    Switch: { defaultProps: { colorScheme: "teal" } },
  },
});

export default function App({
  Component,
  pageProps,
}: AppProps<{
  dehydratedState: unknown;
  initialSession: Session;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <ChakraProvider theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </SessionContextProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

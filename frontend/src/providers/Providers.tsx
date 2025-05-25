import { FC, ReactNode } from "react";
import { ThemeProviderWrapper } from "./theme/ThemeContext";
import { RouterProvider } from "./router/RouterProvider";
import { ApolloProvider } from "./apollo/ApolloProvider";
import { SnackbarProvider } from "./snackbar/SnackbarContext";

type ProvidersProps = {
  children?: ReactNode;
};

export const Providers: FC<ProvidersProps> = () => {
  return (
    <SnackbarProvider>
      <ApolloProvider>
        <ThemeProviderWrapper>
          <RouterProvider />
        </ThemeProviderWrapper>
      </ApolloProvider>
    </SnackbarProvider>
  );
};

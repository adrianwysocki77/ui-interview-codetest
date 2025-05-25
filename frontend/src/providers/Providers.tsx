import { FC, ReactNode } from "react";
import { ThemeProviderWrapper } from "./theme/ThemeContext";
import { RouterProvider } from "./router/RouterProvider";
import { ApolloProvider } from "./apollo/ApolloProvider";

type ProvidersProps = {
  children?: ReactNode;
};

export const Providers: FC<ProvidersProps> = () => {
  return (
    <ApolloProvider>
      <ThemeProviderWrapper>
        <RouterProvider />
      </ThemeProviderWrapper>
    </ApolloProvider>
  );
};

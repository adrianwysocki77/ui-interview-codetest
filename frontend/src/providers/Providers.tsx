import { FC, ReactNode } from "react";
import { ThemeProviderWrapper } from "./theme/ThemeContext";
import { RouterProvider } from "./router/RouterProvider";

type ProvidersProps = {
  children?: ReactNode;
};

export const Providers: FC<ProvidersProps> = () => {
  return (
    <ThemeProviderWrapper>
      <RouterProvider />
    </ThemeProviderWrapper>
  );
};

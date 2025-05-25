import { FC, ReactNode } from "react";
import { ThemeProviderWrapper } from "../theme/ThemeContext";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers: FC<ProvidersProps> = ({ children }) => {
  return <ThemeProviderWrapper>{children}</ThemeProviderWrapper>;
};

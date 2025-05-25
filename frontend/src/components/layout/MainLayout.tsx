import { FC, ReactNode } from "react";
import { Box } from "@mui/material";
import { Header } from "./Header";

type MainLayoutProps = {
  children: ReactNode;
};

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header />
      {children}
    </Box>
  );
};

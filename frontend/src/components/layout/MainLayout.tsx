import { FC } from "react";
import { Box } from "@mui/material";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";

export const MainLayout: FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header />
      <Outlet />
    </Box>
  );
};

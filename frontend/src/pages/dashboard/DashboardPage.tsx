import { FC } from "react";
import { Typography, Container, useTheme, useMediaQuery } from "@mui/material";

export const DashboardPage: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, px: isMobile ? 2 : 3 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{
          textAlign: isMobile ? "center" : "left",
          wordBreak: "break-word",
        }}
      >
        Welcome to Security Dashboard
      </Typography>
    </Container>
  );
};

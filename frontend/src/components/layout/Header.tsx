import { FC } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Tooltip,
  CircularProgress,
  Stack,
} from "@mui/material";
import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "@/api/hooks/useUser";

export const Header: FC = () => {
  const theme = useTheme();
  const { user, loading } = useUser();

  // Generate initials from user name
  const getInitials = (name?: string): string => {
    if (!name) return "U";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }

    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ px: { xs: 3, sm: 5 }, py: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span role="img" aria-label="security" style={{ marginRight: "8px" }}>
            🔒
          </span>
          Security Dashboard
        </Typography>

        {/* Controls section with proper spacing */}
        <Stack direction="row" spacing={2.5} alignItems="center">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* User avatar from GraphQL data */}
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Tooltip title={user?.name || "User"}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText,
                  fontWeight: "medium",
                  textTransform: "uppercase",
                  width: 38,
                  height: 38,
                }}
              >
                {getInitials(user?.name)}
              </Avatar>
            </Tooltip>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

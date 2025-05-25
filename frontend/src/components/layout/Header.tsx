import { FC } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { ThemeToggle } from "./ThemeToggle";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

export const Header: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Security Dashboard
        </Typography>
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={RouterLink} to="/" onClick={handleClose}>
                Dashboard
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/settings"
                onClick={handleClose}
              >
                Settings
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Stack direction="row" spacing={2} sx={{ mr: 2 }}>
            <Button color="inherit" component={RouterLink} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={RouterLink} to="/settings">
              Settings
            </Button>
          </Stack>
        )}
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  );
};

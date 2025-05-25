import { FC } from "react";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeContext } from "../../providers/theme/ThemeContext";

export const ThemeToggle: FC = () => {
  const { isDarkMode, toggleColorMode } = useThemeContext();

  return (
    <IconButton
      onClick={toggleColorMode}
      color="inherit"
      aria-label="toggle theme"
    >
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

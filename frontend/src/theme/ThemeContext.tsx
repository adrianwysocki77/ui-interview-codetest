import { createContext, useContext, useState, FC, ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

type ThemeProviderWrapperProps = {
  children: ReactNode;
};

export const ThemeProviderWrapper: FC<ThemeProviderWrapperProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  });

  const toggleColorMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

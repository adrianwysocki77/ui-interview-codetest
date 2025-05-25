import { FC } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { ThemeToggle } from './ThemeToggle';

export const Header: FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Security Dashboard
        </Typography>
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  );
};

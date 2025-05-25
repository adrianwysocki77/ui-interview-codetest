import { FC } from 'react';
import { Typography, Container } from '@mui/material';

export const DashboardPage: FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Security Dashboard
      </Typography>
    </Container>
  );
};

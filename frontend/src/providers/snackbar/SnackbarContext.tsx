import { 
  createContext, 
  useContext, 
  useState, 
  FC, 
  ReactNode,
  useCallback
} from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertColor 
} from '@mui/material';

interface SnackbarContextType {
  showMessage: (message: string, severity: AlertColor) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

interface SnackbarMessage {
  message: string;
  severity: AlertColor;
}

export const SnackbarProvider: FC<SnackbarProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<SnackbarMessage>({ message: '', severity: 'info' });

  const showMessage = useCallback((message: string, severity: AlertColor) => {
    setMessage({ message, severity });
    setOpen(true);
  }, []);

  const showError = useCallback((message: string) => {
    showMessage(message, 'error');
  }, [showMessage]);

  const showSuccess = useCallback((message: string) => {
    showMessage(message, 'success');
  }, [showMessage]);

  const showInfo = useCallback((message: string) => {
    showMessage(message, 'info');
  }, [showMessage]);

  const showWarning = useCallback((message: string) => {
    showMessage(message, 'warning');
  }, [showMessage]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showMessage, showError, showSuccess, showInfo, showWarning }}>
      {children}
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={message.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

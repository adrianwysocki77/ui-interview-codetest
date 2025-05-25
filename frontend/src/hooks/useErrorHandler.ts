import { useSnackbar } from '../providers/snackbar/SnackbarContext.tsx';

/**
 * Generic error handler hook that can be used across the application
 * for consistent error handling behavior
 */
export const useErrorHandler = () => {
  const { showError, showWarning, showInfo } = useSnackbar();

  return {
    /**
     * Handle GraphQL errors
     */
    handleGraphQLError: (message: string) => {
      console.error(`GraphQL Error: ${message}`);
      showError(`GraphQL Error: ${message}`);
    },

    /**
     * Handle network errors
     */
    handleNetworkError: (error: Error) => {
      console.error(`Network Error: ${error.message}`);
      showError(`Network Error: ${error.message}`);
    },

    /**
     * Handle generic errors
     */
    handleError: (error: Error | string) => {
      const message = typeof error === 'string' ? error : error.message;
      console.error(`Error: ${message}`);
      showError(`Error: ${message}`);
    },

    /**
     * Handle warnings
     */
    handleWarning: (message: string) => {
      console.warn(`Warning: ${message}`);
      showWarning(`Warning: ${message}`);
    },

    /**
     * Handle informational messages
     */
    handleInfo: (message: string) => {
      console.info(`Info: ${message}`);
      showInfo(`Info: ${message}`);
    }
  };
};

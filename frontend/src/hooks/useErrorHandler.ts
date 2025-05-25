import { useSnackbar } from '../providers/snackbar/SnackbarContext';
import { ApolloError } from '@apollo/client';

export const useErrorHandler = () => {
  const { showError, showSuccess } = useSnackbar();
  
  const handleError = (error: unknown) => {
    if (error instanceof ApolloError) {
      if (error.graphQLErrors?.length) {
        const message = error.graphQLErrors[0].message;
        console.error('GraphQL error:', message);
        showError(message);
        return;
      }
      if (error.networkError) {
        console.error('Network error:', error.networkError);
        showError('Network connection issue. Please try again.');
        return;
      }
    }
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      showError(error.message);
      return;
    }
    
    const message = typeof error === 'string' ? error : 'An unexpected error occurred';
    console.error('Unknown error:', error);
    showError(message);
  };

  return {
    handleError,
    showSuccess
  };
};

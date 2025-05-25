import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../queries/user';
import { UPDATE_USER } from '../mutations/updateUser';
import {
  UserResponse,
  UpdateUserMutationVariables,
  UpdateUserResponse,
} from '@/types/graphql';
import { useSnackbar } from '@/providers/snackbar/SnackbarContext';

// Simple error handler using snackbar
const useErrorHandler = () => {
  const { showError, showSuccess } = useSnackbar();
  return {
    handleGraphQLError: (message: string) => {
      console.error(`GraphQL Error: ${message}`);
      showError(`GraphQL Error: ${message}`);
    },
    showSuccess: (message: string) => {
      showSuccess(message);
    }
  };
};

export const useUser = () => {
  const { handleGraphQLError, showSuccess } = useErrorHandler();
  
  const { data, loading, error } = useQuery<UserResponse>(GET_USER, {
    onError: (error) => {
      if (error.graphQLErrors?.length) {
        error.graphQLErrors.forEach(err => {
          handleGraphQLError(err.message);
        });
      }
    }
  });

  const [updateUser, { loading: updateLoading, error: updateError }] =
    useMutation<UpdateUserResponse, UpdateUserMutationVariables>(UPDATE_USER, {
      // Refetch user data after mutation
      refetchQueries: [{ query: GET_USER }],
      onCompleted: () => {
        showSuccess('User updated successfully');
      },
      onError: (error) => {
        if (error.graphQLErrors?.length) {
          error.graphQLErrors.forEach(err => {
            handleGraphQLError(err.message);
          });
        }
      }
    });

  return {
    user: data?.user,
    loading,
    error,
    updateUser,
    updateLoading,
    updateError,
  };
};

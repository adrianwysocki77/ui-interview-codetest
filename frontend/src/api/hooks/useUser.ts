import { useQuery, useMutation } from "@apollo/client";
import { GET_USER } from "../queries/user";
import { UPDATE_USER } from "../mutations/updateUser";
import {
  UserResponse,
  UpdateUserMutationVariables,
  UpdateUserResponse,
} from "@/types/graphql";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export const useUser = () => {
  const { handleError, showSuccess } = useErrorHandler();

  const { data, loading, error } = useQuery<UserResponse>(GET_USER, {
    onError: handleError,
  });

  const [updateUser, { loading: updateLoading, error: updateError }] =
    useMutation<UpdateUserResponse, UpdateUserMutationVariables>(UPDATE_USER, {
      // Refetch user data after mutation
      refetchQueries: [{ query: GET_USER }],
      onCompleted: () => {
        showSuccess("User updated successfully");
      },
      onError: handleError,
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

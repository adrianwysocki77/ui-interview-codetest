import { useQuery, useMutation } from "@apollo/client";
import { GET_USER } from "../queries/user";
import { UPDATE_USER } from "../mutations/updateUser";
import {
  UserResponse,
  UpdateUserMutationVariables,
  UpdateUserResponse,
} from "@/types/graphql";

export const useUser = () => {
  const { data, loading, error } = useQuery<UserResponse>(GET_USER);

  const [updateUser, { loading: updateLoading, error: updateError }] =
    useMutation<UpdateUserResponse, UpdateUserMutationVariables>(UPDATE_USER, {
      // Refetch user data after mutation
      refetchQueries: [{ query: GET_USER }],
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

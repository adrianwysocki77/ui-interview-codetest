import { gql, useQuery } from '@apollo/client';

export type User = {
  id: string;
  name: string;
};

export type UserQueryResponse = {
  user: User;
};

const GET_USER = gql`
  query GetUser {
    user {
      id
      name
    }
  }
`;

export const useUserData = () => {
  const { data, loading, error, refetch } = useQuery<UserQueryResponse>(GET_USER);

  // Generate initials from name
  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return {
    user: data?.user,
    loading,
    error,
    refetch,
    initials: getInitials(data?.user?.name)
  };
};

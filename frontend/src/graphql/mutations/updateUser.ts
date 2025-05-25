import { gql } from '@apollo/client';

export const UPDATE_USER = gql`
  mutation UpdateUser($name: String) {
    updateUser(name: $name) {
      id
      name
    }
  }
`;

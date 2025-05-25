import { FC, ReactNode } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as BaseApolloProvider,
  HttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

// Error handling link TODO add toast message
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const httpLink = new HttpLink({
  // TODO add env
  uri: "/graphql", // This will be proxied to http://localhost:3000/graphql
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

type ApolloProviderProps = {
  children: ReactNode;
};

export const ApolloProvider: FC<ApolloProviderProps> = ({ children }) => {
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
};

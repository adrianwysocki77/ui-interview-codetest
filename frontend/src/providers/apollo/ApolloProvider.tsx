import { FC, ReactNode } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as BaseApolloProvider,
  HttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

type ApolloProviderProps = {
  children: ReactNode;
};

const httpLink = new HttpLink({
  uri: "/graphql",
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`Network error: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export const ApolloProvider: FC<ApolloProviderProps> = ({ children }) => {
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
};

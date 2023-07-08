import { ApolloClient, InMemoryCache } from '@apollo/client/core'

// Create the apollo client
export const apolloClient = (uri: string) =>
  new ApolloClient({
    uri: uri,
    cache: new InMemoryCache(),
  })

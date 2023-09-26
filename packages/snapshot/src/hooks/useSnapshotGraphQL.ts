import { GraphQLClient } from 'graphql-request'
import { useNetwork } from 'wagmi'

export const useSnapshotGraphQL = () => {
  const { chain } = useNetwork()
  if (!chain) return

  const endpoint = chain.testnet
    ? 'https://testnet.snapshot.org/graphql'
    : 'https://hub.snapshot.org/graphql'

  const fetch = async <T>(query: string, variables: any) => {
    return new GraphQLClient(endpoint).request<T | undefined>(query, variables)
  }

  return {
    fetch,
  }
}

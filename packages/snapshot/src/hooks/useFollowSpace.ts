import { Address } from 'viem'
import { FOLLOWS_QUERY } from '../graphql/queries'
import { useSnapshotApolloQuery } from './useApolloQuery'
import { useEffect } from 'react'

export const useFollowSpace = (
  address: Address | undefined,
  spaceENSAddress?: String,
) => {
  const { data, error, isLoading, isError, isSuccess, query } =
    useSnapshotApolloQuery()

  useEffect(() => {
    if (address !== undefined) {
      query({
        query: FOLLOWS_QUERY,
        variables: {
          follower: address,
          spaceId: spaceENSAddress,
        },
      })
    }
  }, [address])

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    error,
  }
}

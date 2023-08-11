import { Address } from 'viem'
import { USER_VOTE_QUERY } from '../graphql/queries'
import { useSnapshotApolloQuery } from './useApolloQuery'
import { useEffect } from 'react'

export const useUserVote = (
  proposalId: string | undefined,
  userAddress: Address | undefined,
) => {
  const { data, error, isLoading, isError, isSuccess, query } =
    useSnapshotApolloQuery()

  useEffect(() => {
    if (proposalId !== undefined && userAddress !== undefined) {
      query({
        query: USER_VOTE_QUERY,
        variables: {
          proposalId: proposalId,
          userAddress: userAddress,
        },
      })
    }
  }, [proposalId, userAddress])

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    error,
  }
}

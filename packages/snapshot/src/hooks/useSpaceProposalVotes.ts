import { PROPOSAL_VOTES_QUERY } from '../graphql/queries'
import { useApolloQuery } from './useApolloQuery'
import { useEffect } from 'react'

export const useSpaceProposalVotes = (proposalId: String | undefined) => {
  const { data, error, isLoading, isError, isSuccess, query } = useApolloQuery()

  useEffect(() => {
    if (proposalId !== undefined) {
      query({
        query: PROPOSAL_VOTES_QUERY,
        variables: {
          proposalId: proposalId,
        },
      })
    }
  }, [proposalId])

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    error,
  }
}

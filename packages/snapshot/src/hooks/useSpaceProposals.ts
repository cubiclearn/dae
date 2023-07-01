import { PROPOSALS_QUERY } from '../graphql/queries'
import { useApolloQuery } from './useApolloQuery'
import { useEffect } from 'react'
import { Proposal } from '../graphql/types'

type UseSpaceProposalsResult = {
  data: { proposals: Proposal[] | null }
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  error: any
}

export const useSpaceProposals = (
  spaceId: String | undefined,
  state: String | undefined,
): UseSpaceProposalsResult => {
  const { data, error, isLoading, isError, isSuccess, query } = useApolloQuery()

  useEffect(() => {
    if (spaceId !== undefined && state !== undefined) {
      query({
        query: PROPOSALS_QUERY,
        variables: {
          spaceId: spaceId,
          state: state,
        },
      })
    }
  }, [spaceId, state])

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    error,
  }
}

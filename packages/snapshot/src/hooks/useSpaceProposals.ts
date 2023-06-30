import { PROPOSALS_QUERY } from '../graphql/queries'
import { useApolloQuery } from './useApolloQuery'
import { useEffect } from 'react'

export const useSpaceProposals = (
  spaceId: String | undefined,
  state: String | undefined,
) => {
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

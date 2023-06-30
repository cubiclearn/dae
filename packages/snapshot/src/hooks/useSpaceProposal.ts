import { PROPOSALS_QUERY } from '../graphql/queries'
import { useApolloQuery } from './useApolloQuery'
import { useEffect } from 'react'

export const useSpaceProposal = (spaceId: String | undefined) => {
  const { data, error, isLoading, isError, isSuccess, query } = useApolloQuery()

  useEffect(() => {
    if (spaceId !== undefined) {
      query({
        query: PROPOSALS_QUERY,
        variables: {
          spaceId: spaceId,
        },
      })
    }
  }, [spaceId])

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    error,
  }
}

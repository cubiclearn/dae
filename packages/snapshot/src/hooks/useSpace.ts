import { SPACE_QUERY } from '../graphql/queries'
import { useSnapshotApolloQuery } from './useApolloQuery'
import { useEffect } from 'react'

export const useSpace = (spaceId: String | undefined) => {
  const { data, error, isLoading, isError, isSuccess, query } =
    useSnapshotApolloQuery()

  useEffect(() => {
    if (spaceId !== undefined) {
      query({
        query: SPACE_QUERY,
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

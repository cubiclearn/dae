import useSWR from 'swr'
import { useSnapshotGraphQL } from './useSnapshotGraphQL'
import { SPACE_QUERY } from '../graphql/queries'
import { type SWRHook } from '@dae/types'

export const useSpace = (spaceId: String | undefined): SWRHook<SPACE_QUERY> => {
  const client = useSnapshotGraphQL()
  const shouldFetch = spaceId !== undefined

  const { data, error } = useSWR(
    [SPACE_QUERY, { spaceId: spaceId }],
    ([query, variables]) => client?.fetch<SPACE_QUERY>(query, variables),
    { isPaused: () => !shouldFetch },
  )

  return {
    data,
    isLoading: Boolean(!data && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(data && !error),
  }
}

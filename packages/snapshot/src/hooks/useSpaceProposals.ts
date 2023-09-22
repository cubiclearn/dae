import { PROPOSALS_QUERY } from '../graphql/queries'
import { useSnapshotGraphQL } from './useSnapshotGraphQL'
import useSWR from 'swr'
import { type SWRHook } from '@dae/types'

export const useSpaceProposals = (
  spaceId: String | undefined,
  state: String | undefined,
): SWRHook<PROPOSALS_QUERY> => {
  const client = useSnapshotGraphQL()
  const shouldFetch = spaceId !== undefined && state !== undefined

  const { data, error } = useSWR(
    [PROPOSALS_QUERY, { spaceId: spaceId, state: state }],
    ([query, variables]) => client?.fetch<PROPOSALS_QUERY>(query, variables),
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

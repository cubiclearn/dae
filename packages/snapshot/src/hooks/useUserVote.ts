import useSWR from 'swr'
import { Address } from 'viem'
import { USER_VOTES_QUERY } from '../graphql/queries'
import { useSnapshotGraphQL } from './useSnapshotGraphQL'
import { type SWRHook } from '@dae/types'

export const useUserVote = (
  proposalId: string | undefined,
  userAddress: Address | undefined,
): SWRHook<USER_VOTES_QUERY> => {
  const client = useSnapshotGraphQL()
  const shouldFetch = proposalId !== undefined && userAddress !== undefined

  const { data, error } = useSWR(
    [USER_VOTES_QUERY, { proposalId: proposalId, userAddress: userAddress }],
    ([query, variables]) => client?.fetch<USER_VOTES_QUERY>(query, variables),
    { isPaused: () => !shouldFetch },
  )

  return {
    data: data,
    isLoading: Boolean(!data && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(data && !error),
  }
}

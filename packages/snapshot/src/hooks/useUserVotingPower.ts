import { Address } from 'viem'
import { USER_VOTING_POWER_QUERY } from '../graphql/queries'
import useSWR from 'swr'
import { useSnapshotGraphQL } from './useSnapshotGraphQL'
import { type SWRHook } from '@dae/types'

export const useUserVotingPower = (
  proposalId: string | undefined,
  userAddress: Address | undefined,
  spaceId: string | undefined,
): SWRHook<USER_VOTING_POWER_QUERY> => {
  const client = useSnapshotGraphQL()
  const shouldFetch = proposalId !== undefined

  const { data, error } = useSWR(
    [
      USER_VOTING_POWER_QUERY,
      { proposalId: proposalId, userAddress: userAddress, spaceId: spaceId },
    ],
    ([query, variables]) =>
      client?.fetch<USER_VOTING_POWER_QUERY>(query, variables),
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

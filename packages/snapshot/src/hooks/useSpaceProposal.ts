import { PROPOSAL_QUERY } from '../graphql/queries'
import { useSnapshotGraphQL } from './useSnapshotGraphQL'
import useSWR from 'swr'
import { type SWRHook } from '@dae/types'

export const useSpaceProposal = (
  proposalId: String | undefined,
): SWRHook<PROPOSAL_QUERY> => {
  const client = useSnapshotGraphQL()
  const shouldFetch = proposalId !== undefined

  const { data, error } = useSWR(
    [PROPOSAL_QUERY, { proposalId: proposalId }],
    ([query, variables]) => client?.fetch<PROPOSAL_QUERY>(query, variables),
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

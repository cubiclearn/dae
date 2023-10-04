import useSWR from 'swr'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRHook } from '@dae/types'
import { PROPOSAL_QUERY } from '../../graphql'

export const useCourseProposal = (
  proposalId: string | undefined,
  chainId: number | undefined,
): SWRHook<PROPOSAL_QUERY> => {
  const client = useApi()
  const shouldFetch = proposalId !== undefined && chainId !== undefined

  const { data: response, error } = useSWR<ApiResponse<PROPOSAL_QUERY>>(
    shouldFetch
      ? [
          'course/space/proposal',
          {
            proposalId: proposalId,
            chainId: chainId,
          },
        ]
      : null,
    ([query, variables]: ApiRequestUrlAndParams) =>
      client.request(query, variables),
  )

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

import useSWR from 'swr'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRHook } from '@dae/types'
import { USER_VOTES_QUERY } from '../../graphql'
import { Address } from 'wagmi'

export const useCourseProposalUserVote = (
  proposalId: string | undefined,
  chainId: number | undefined,
  userAddress: Address | undefined,
): SWRHook<USER_VOTES_QUERY> => {
  const client = useApi()
  const shouldFetch =
    proposalId !== undefined &&
    chainId !== undefined &&
    userAddress !== undefined

  const { data: response, error } = useSWR<ApiResponse<USER_VOTES_QUERY>>(
    shouldFetch
      ? [
          'course/space/proposal/user/vote',
          {
            proposalId: proposalId,
            userAddress: userAddress,
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

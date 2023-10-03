import useSWR from 'swr'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRHook } from '@dae/types'
import { USER_VOTING_POWER_QUERY } from '../../graphql'
import { Address } from 'wagmi'

export const useCourseProposalUserVotingPower = (
  courseAddress: Address | undefined,
  proposalId: string | undefined,
  chainId: number | undefined,
  userAddress: Address | undefined,
): SWRHook<USER_VOTING_POWER_QUERY> => {
  const client = useApi()
  const shouldFetch =
    proposalId !== undefined &&
    chainId !== undefined &&
    userAddress !== undefined &&
    courseAddress !== undefined

  const { data: response, error } = useSWR<
    ApiResponse<USER_VOTING_POWER_QUERY>
  >(
    shouldFetch
      ? [
          'course/space/proposal/user/vp',
          {
            courseAddress: courseAddress,
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

import { Address } from 'viem'
import useSWR from 'swr'
import { Credential } from '@dae/database'
import { ApiResponse, SWRHook } from '@dae/types'
import { ApiRequestUrlAndParams, useApi } from './useApi'

export const useUserCourseCredentials = (
  userAddress: Address | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<{ credentials: Credential[] }> => {
  const client = useApi()
  const shouldFetch = courseAddress && chainId && userAddress

  const { data: response, error } = useSWR<
    ApiResponse<{ credentials: Credential[] }>
  >(
    shouldFetch
      ? [
          'course/credentials',
          {
            courseAddress: courseAddress,
            chainId: chainId,
            userAddress: userAddress,
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

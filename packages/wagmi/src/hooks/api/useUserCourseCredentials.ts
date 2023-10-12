import { Address } from 'viem'
import useSWR from 'swr'
import { Credential } from '@dae/database'
import { ApiResponse, SWRHook } from '@dae/types'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { useNetwork } from 'wagmi'

export const useUserCourseCredentials = ({
  courseAddress,
  userAddress,
}: {
  courseAddress: Address | undefined
  userAddress: Address | undefined
}): SWRHook<{ credentials: Credential[] }> => {
  const client = useApi()
  const { chain } = useNetwork()
  const shouldFetch = courseAddress && chain?.id && userAddress

  const { data: response, error } = useSWR<
    ApiResponse<{ credentials: Credential[] }>
  >(
    shouldFetch
      ? [
          'user/course/credentials',
          {
            courseAddress: courseAddress,
            chainId: chain.id,
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

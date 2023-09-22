import { Address } from 'viem'
import useSWR from 'swr'
import { Credential } from '@dae/database'
import { ApiResponse, SWRHook } from '@dae/types'
import { useApi } from './useApi'

export const useUserCourseCredentials = (
  userAddress: Address | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<{ credentials: Credential[] }> => {
  const client = useApi()
  const url = `/api/v0/user/course/credentials?courseAddress=${courseAddress}&chainId=${chainId}&userAddress=${userAddress}`

  const shouldFetch = courseAddress && chainId && userAddress

  const { data: response, error } = useSWR<
    ApiResponse<{ credentials: Credential[] }>
  >(shouldFetch ? url : null, client.request, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  })

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

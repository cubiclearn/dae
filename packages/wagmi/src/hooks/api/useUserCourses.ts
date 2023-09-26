import { Address } from 'viem'
import useSWR from 'swr'
import { Course } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from './useApi'
import { ApiResponse, SWRHook } from '@dae/types'

export const useUserCourses = (
  userAddress: Address | undefined,
  chainId: number | undefined,
  role: 'EDUCATOR' | 'DISCIPULUS',
): SWRHook<{ courses: Course[] }> => {
  const client = useApi()
  const shouldFetch = userAddress !== undefined && chainId !== undefined

  const { data: response, error } = useSWR<ApiResponse<{ courses: Course[] }>>(
    shouldFetch
      ? [
          'user/courses',
          {
            userAddress: userAddress,
            chainId: chainId,
            role: role,
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

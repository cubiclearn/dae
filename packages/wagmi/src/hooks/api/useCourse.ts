import { Address } from 'viem'
import useSWR from 'swr'
import { Course } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from './useApi'
import { ApiResponse } from '@dae/types'
import { type SWRHook } from '@dae/types'

export const useCourse = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<{ course: Course }> => {
  const client = useApi()
  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const { data: response, error } = useSWR<ApiResponse<{ course: Course }>>(
    shouldFetch
      ? ['course', { address: courseAddress, chainId: chainId }]
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

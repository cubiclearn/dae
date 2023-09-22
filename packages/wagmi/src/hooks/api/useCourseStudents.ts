import { Address } from 'viem'
import useSWR from 'swr'
import { UserCredentials } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from './useApi'
import { ApiResponse, SWRHook } from '@dae/types'

export const useCourseStudents = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<{ students: UserCredentials[] }> => {
  const client = useApi()

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const { data: response, error } = useSWR<
    ApiResponse<{ students: UserCredentials[] }>
  >(
    shouldFetch
      ? [
          'course/students',
          {
            courseAddress: courseAddress,
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

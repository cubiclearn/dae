import { Address } from 'viem'
import useSWR from 'swr'
import { UserCredentials } from '@dae/database'
import { useApi } from './useApi'
import { ApiResponse, SWRHook } from '@dae/types'

export const useCourseStudents = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<{ students: UserCredentials[] }> => {
  const client = useApi()
  const url = `/api/v0/course/students?courseAddress=${courseAddress}&chainId=${chainId}`

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const { data: response, error } = useSWR<
    ApiResponse<{ students: UserCredentials[] }>
  >(shouldFetch ? url : null, client.request)

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

import { Address } from 'viem'
import useSWR from 'swr'
import { Course } from '@dae/database'
import { useApi } from './useApi'
import { ApiResponse } from '@dae/types'
import { type SWRHook } from '@dae/types'

export const useCourse = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<{ course: Course }> => {
  const client = useApi()
  const url = `/api/v0/course?address=${courseAddress}&chainId=${chainId}`

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const { data: response, error } = useSWR<ApiResponse<{ course: Course }>>(
    shouldFetch ? url : null,
    client.request,
  )

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

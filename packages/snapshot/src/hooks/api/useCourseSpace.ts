import useSWRImmutable from 'swr/immutable'
import { Address } from 'viem'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRHook } from '@dae/types'
import { SPACE_QUERY } from '../../graphql'

export const useCourseSpace = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<SPACE_QUERY> => {
  const client = useApi()
  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const { data: response, error } = useSWRImmutable<ApiResponse<SPACE_QUERY>>(
    shouldFetch
      ? [
          'course/space',
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

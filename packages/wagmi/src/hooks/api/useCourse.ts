import { Address } from 'viem'
import useSWRImmutable from 'swr/immutable'
import { Course } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse } from '@dae/types'
import { type SWRHook } from '@dae/types'
import { useNetwork } from 'wagmi'

export const useCourse = ({
  courseAddress,
}: {
  courseAddress: Address | undefined
}): SWRHook<{ course: Course }> => {
  const client = useApi()
  const { chain } = useNetwork()
  const shouldFetch = courseAddress !== undefined && chain?.id !== undefined

  const { data: response, error } = useSWRImmutable<
    ApiResponse<{ course: Course }>
  >(
    shouldFetch
      ? ['course', { address: courseAddress, chainId: chain.id }]
      : null,
    ([query, variables]: ApiRequestUrlAndParams) =>
      client.request(query, variables),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

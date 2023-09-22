import useSWR from 'swr'
import { Credential } from '@dae/database'
import { Address } from 'viem'
import { ApiRequestUrlAndParams, useApi } from './useApi'
import { ApiResponse, SWRHook } from '@dae/types'

export const useCourseCredential = (
  credentialCid: string | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<{ credential: Credential }> => {
  const client = useApi()
  const shouldFetch =
    credentialCid !== undefined &&
    courseAddress !== undefined &&
    chainId !== undefined

  const { data: response, error } = useSWR<
    ApiResponse<{ credential: Credential }>
  >(
    shouldFetch
      ? [
          '/api/v0/course/credential',
          {
            credentialCid: credentialCid,
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

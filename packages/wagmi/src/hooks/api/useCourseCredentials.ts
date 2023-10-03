import { Address } from 'viem'
import useSWR from 'swr'
import { Credential, CredentialType } from '@dae/database'
import { ApiResponse, SWRHook } from '@dae/types'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'

export const useCourseCredentials = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
  credentialType?: CredentialType | undefined,
): SWRHook<{ credentials: Credential[] }> => {
  const client = useApi()

  const shouldFetch = courseAddress && chainId

  const { data: response, error } = useSWR<
    ApiResponse<{ credentials: Credential[] }>
  >(
    shouldFetch
      ? [
          'course/credentials',
          {
            address: courseAddress,
            chainId: chainId,
            type: credentialType,
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

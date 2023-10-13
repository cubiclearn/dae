import { Address } from 'viem'
import useSWR from 'swr'
import { Credential, CredentialType } from '@dae/database'
import { ApiResponse, SWRHook } from '@dae/types'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { useNetwork } from 'wagmi'

export const useCourseCredentials = ({
  courseAddress,
  credentialType,
}: {
  courseAddress: Address | undefined
  credentialType?: CredentialType | undefined
}): SWRHook<{ credentials: Credential[] }> => {
  const client = useApi()
  const { chain } = useNetwork()
  const shouldFetch = courseAddress && chain?.id

  const { data: response, error } = useSWR<
    ApiResponse<{ credentials: Credential[] }>
  >(
    shouldFetch
      ? [
          'course/credentials',
          {
            address: courseAddress,
            chainId: chain.id,
            type: credentialType,
          },
        ]
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

import { Address } from 'viem'
import useSWR from 'swr'
import { Credential, CredentialType } from '@dae/database'
import { ApiResponse, SWRHook } from '@dae/types'
import { useApi } from './useApi'

export const useCourseCredentials = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
  credentialType?: CredentialType | undefined,
): SWRHook<{ credentials: Credential[] }> => {
  const client = useApi()
  const URLParams = new URLSearchParams()

  if (courseAddress) {
    URLParams.append('address', courseAddress)
  }

  if (chainId) {
    URLParams.append('chainId', chainId.toString())
  }

  if (credentialType) {
    URLParams.append('type', credentialType)
  }

  const url = `/api/v0/course/credentials?${URLParams}`

  const shouldFetch = courseAddress && chainId

  const { data: response, error } = useSWR<
    ApiResponse<{ credentials: Credential[] }>
  >(shouldFetch ? url : null, client.request, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  })

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

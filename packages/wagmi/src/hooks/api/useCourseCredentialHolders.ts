import useSWR from 'swr'
import { UserCredentials } from '@dae/database'
import { Address } from 'viem'
import { useApi } from './useApi'
import { ApiResponse, SWRHook } from '@dae/types'

export const useCourseCredentialHolders = (
  credentialCid: string | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRHook<{ userCredentials: UserCredentials[] }> => {
  const client = useApi()
  const shouldFetch =
    credentialCid !== undefined &&
    courseAddress !== undefined &&
    chainId !== undefined

  const url = () =>
    `/api/v0/course/credential/users?credentialCid=${credentialCid}&courseAddress=${courseAddress}&chainId=${chainId?.toString()}`

  const { data: response, error } = useSWR<
    ApiResponse<{ userCredentials: UserCredentials[] }>
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

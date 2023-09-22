import useSWR from 'swr'
import { Credential } from '@dae/database'
import { Address } from 'viem'
import { useApi } from './useApi'
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

  const url = `/api/v0/course/credential?credentialCid=${credentialCid}&courseAddress=${courseAddress}&chainId=${chainId?.toString()}`

  const { data: response, error } = useSWR<
    ApiResponse<{ credential: Credential }>
  >(shouldFetch ? url : null, client.request)

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

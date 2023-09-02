import useSWR from 'swr'
import { UserCredentials } from '@dae/database'
import { Address } from 'viem'
import { useMemo } from 'react'

interface useCourseCredentialHoldersData {
  data: UserCredentials[] | null
  error: Error | null
  isLoading: boolean
}

interface ApiResponse {
  success: boolean
  data: {
    credentialUsers: UserCredentials[]
  }
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json() as Promise<ApiResponse>
}

export const useCourseCredentialHolders = (
  credentialCid: string | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
): useCourseCredentialHoldersData => {
  const shouldFetch =
    credentialCid !== undefined &&
    courseAddress !== undefined &&
    chainId !== undefined

  const url = useMemo(
    () =>
      `/api/v0/course/credential/users?credentialCid=${credentialCid}&courseAddress=${courseAddress}&chainId=${chainId?.toString()}`,
    [credentialCid, courseAddress, chainId],
  )

  const { data, error, isLoading, isValidating } = useSWR<ApiResponse>(
    shouldFetch ? url : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
    },
  )

  return {
    data: data?.data.credentialUsers ?? null,
    error,
    isLoading: isLoading || isValidating,
  }
}

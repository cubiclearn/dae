import useSWR from 'swr'
import { Credential } from '@dae/database'
import { Address } from 'viem'
import { useMemo } from 'react'

interface useCourseCredentialData {
  data: Credential | null
  error: Error | null
  isLoading: boolean
}

interface ApiResponse {
  success: boolean
  data: {
    credential: Credential
  }
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json() as Promise<ApiResponse>
}

export const useCourseCredential = (
  credentialCid: string | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
): useCourseCredentialData => {
  const shouldFetch =
    credentialCid !== undefined &&
    courseAddress !== undefined &&
    chainId !== undefined

  const url = useMemo(
    () =>
      `/api/v0/course/credential?credentialCid=${credentialCid}&courseAddress=${courseAddress}&chainId=${chainId?.toString()}`,
    [credentialCid, courseAddress, chainId],
  )

  const { data, error, isLoading } = useSWR<ApiResponse>(
    shouldFetch ? url : null,
    fetcher,
  )

  return {
    data: data?.data.credential ?? null,
    error,
    isLoading: isLoading,
  }
}

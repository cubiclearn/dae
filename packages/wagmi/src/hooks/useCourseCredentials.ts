import { Address } from 'viem'
import useSWR from 'swr'
import { Credential } from '@dae/database'

interface UseCourseCredentialsData {
  data: Credential[] | null
  error: Error | null
  isLoading: boolean
}

interface ApiResponse {
  success: boolean
  data?: { credentials: Credential[] | null }
  error?: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export const useCourseCredentials = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): UseCourseCredentialsData => {
  const url = `/api/v0/course/credentials?address=${courseAddress}&chainId=${chainId}`

  const shouldFetch = courseAddress && chainId

  const {
    data: response,
    error,
    isLoading,
    isValidating,
  } = useSWR<ApiResponse>(shouldFetch ? url : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  })

  return {
    data: response?.data?.credentials ?? null,
    error,
    isLoading: isLoading || isValidating,
  }
}

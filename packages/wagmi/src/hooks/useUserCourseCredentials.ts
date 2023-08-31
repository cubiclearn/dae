import { Address } from 'viem'
import useSWR from 'swr'
import { Credential } from '@dae/database'
import { useAccount } from 'wagmi'

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

export const useUserCourseCredentials = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): UseCourseCredentialsData => {
  const { address: userAddress } = useAccount()
  const url = `/api/v0/user/course/credentials?courseAddress=${courseAddress}&chainId=${chainId}&userAddress=${userAddress}`

  const shouldFetch = courseAddress && chainId && userAddress

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ApiResponse>(shouldFetch ? url : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  })

  return {
    data: response?.data?.credentials ?? null,
    error,
    isLoading,
  }
}

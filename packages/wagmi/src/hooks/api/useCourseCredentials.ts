import { Address } from 'viem'
import useSWR from 'swr'
import { Credential, CredentialType } from '@dae/database'

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
  credentialType?: CredentialType | undefined,
): UseCourseCredentialsData => {
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

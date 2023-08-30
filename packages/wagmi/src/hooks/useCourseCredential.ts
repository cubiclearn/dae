import useSWR from 'swr'
import { Credential } from '@dae/database'

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
  credentialId: number | undefined,
): useCourseCredentialData => {
  const url = `/api/v0/course/credential?credentialId=${credentialId}`

  const shouldFetch = credentialId !== undefined

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

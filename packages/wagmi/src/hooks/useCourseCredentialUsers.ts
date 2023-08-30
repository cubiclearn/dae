import useSWR from 'swr'
import { UserCredentials } from '@dae/database'

interface useCourseCredentialUsersData {
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

export const useCourseCredentialUsers = (
  credentialId: number | undefined,
): useCourseCredentialUsersData => {
  const url = `/api/v0/course/credential/users?credentialId=${credentialId}`

  const shouldFetch = credentialId !== undefined

  const { data, error, isLoading } = useSWR<ApiResponse>(
    shouldFetch ? url : null,
    fetcher,
  )

  return {
    data: data?.data.credentialUsers ?? null,
    error,
    isLoading: isLoading,
  }
}

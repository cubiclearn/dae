import { Address } from 'viem'
import useSWR from 'swr'
import { UserCredentials } from '@dae/database'

interface CourseCredentialsResponse {
  success: boolean
  data: {
    students: UserCredentials[]
  }
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json() as Promise<CourseCredentialsResponse>
}

export const useCourseStudents = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
) => {
  const url = `/api/v0/course/students?courseAddress=${courseAddress}&chainId=${chainId}`

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const { data, error, isLoading } = useSWR<CourseCredentialsResponse>(
    shouldFetch ? url : null,
    fetcher,
  )

  if (!shouldFetch) {
    return {
      data: null,
      error: new Error(
        'You are not connected to Web3. Please connect your wallet before proceeding.',
      ),
      isLoading: false,
    }
  }

  return {
    data,
    error,
    isLoading,
  }
}

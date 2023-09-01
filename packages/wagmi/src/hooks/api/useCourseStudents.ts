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

  return {
    data,
    error,
    isLoading: isLoading,
  }
}

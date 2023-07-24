import { Address } from 'viem'
import useSWR from 'swr'
import { Course } from '@dae/database'

export interface UseCourseResponse {
  course: Course
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json() as Promise<UseCourseResponse>
}

interface UseCourseData {
  data: Course | null
  error: Error | null
  isLoading: boolean
}

export const useCourse = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): UseCourseData => {
  const url = `/api/v0/course?address=${courseAddress}&chainId=${chainId}`

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const { data, error, isLoading } = useSWR<UseCourseResponse>(
    shouldFetch ? url : null,
    fetcher,
  )

  return {
    data: data?.course || null,
    error,
    isLoading,
  }
}

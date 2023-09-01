import { Address } from 'viem'
import useSWR from 'swr'
import { Course } from '@dae/database'

interface UseCourseData {
  data: Course | null
  error: Error | null
  isLoading: boolean // Corrected
}

interface ApiResponse {
  success: boolean
  data?: { course: Course }
  error?: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export const useCourse = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): UseCourseData => {
  const url = `/api/v0/course?address=${courseAddress}&chainId=${chainId}`

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ApiResponse>(shouldFetch ? url : null, fetcher)

  return {
    data: response?.data?.course ?? null,
    error,
    isLoading,
  }
}

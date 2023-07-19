import { Address } from 'viem'
import useSWR from 'swr'
import { Course } from '@dae/database'

export interface MagisterCoursesResponse {
  courses: Course[]
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json() as Promise<MagisterCoursesResponse>
}

export const useCourses = (
  address: Address | undefined,
  chainId: number | undefined,
  magister: boolean,
) => {
  const url = `/api/v0/${
    magister ? 'magister' : 'discipulus'
  }/courses?address=${address}&chainId=${chainId}`

  const shouldFetch = address !== undefined && chainId !== undefined

  const { data, error, isLoading } = useSWR<MagisterCoursesResponse>(
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

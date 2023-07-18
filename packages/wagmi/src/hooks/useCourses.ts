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
  address: Address,
  chainId: number,
  magister: boolean,
) => {
  const url = `/api/v0/${
    magister ? 'magister' : 'discipulus'
  }/courses?address=${address}&chainId=${chainId}`

  const { data, error, isLoading } = useSWR<MagisterCoursesResponse>(
    url,
    fetcher,
  )

  return {
    data,
    error,
    isLoading,
  }
}

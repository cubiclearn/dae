import { Address } from 'viem'
import useSWR from 'swr'
import { Course } from '@dae/database'

export interface UserCoursesResponse {
  success: boolean
  data: {
    courses: Course[]
  }
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json() as Promise<UserCoursesResponse>
}

export const useUserCourses = (
  address: Address | undefined,
  chainId: number | undefined,
  role: 'MAGISTER' | 'DISCIPULUS',
) => {
  const url = `/api/v0/user/courses?userAddress=${address}&chainId=${chainId}&role=${role}`

  const shouldFetch = address !== undefined && chainId !== undefined

  const { data, error, isLoading } = useSWR<UserCoursesResponse>(
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

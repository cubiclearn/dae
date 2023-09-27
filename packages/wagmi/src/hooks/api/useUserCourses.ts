import { Address } from 'viem'
import useSWR from 'swr'
import { CredentialType, UserCredentials } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from './useApi'
import { ApiResponse, SWRHook } from '@dae/types'

export const useUserCourses = (
  userAddress: Address | undefined,
  chainId: number | undefined,
  roles: CredentialType[],
): SWRHook<{
  credentials: (UserCredentials & {
    course: { name: string; description: string; image_url: string }
  })[]
}> => {
  const client = useApi()
  const shouldFetch = userAddress !== undefined && chainId !== undefined

  const { data: response, error } = useSWR<
    ApiResponse<{
      credentials: (UserCredentials & {
        course: { name: string; description: string; image_url: string }
      })[]
    }>
  >(
    shouldFetch
      ? [
          'user/courses',
          {
            userAddress: userAddress,
            chainId: chainId,
            roles: roles,
          },
        ]
      : null,
    ([query, variables]: ApiRequestUrlAndParams) =>
      client.request(query, variables),
  )

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

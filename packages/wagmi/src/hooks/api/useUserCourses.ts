import { Address } from 'viem'
import { CredentialType, UserCredentials } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from './useApi'
import { ApiResponse, SWRInfiniteHook } from '@dae/types'
import useSWRInfinite from 'swr/infinite'

const PAGE_SIZE = 10

type ApiResponseType = {
  credentials: (UserCredentials & {
    course: { name: string; description: string; image_url: string }
  })[]
}

export const useUserCourses = (
  userAddress: Address | undefined,
  chainId: number | undefined,
  roles: CredentialType[],
): SWRInfiniteHook<ApiResponseType> => {
  const client = useApi()
  const shouldFetch = userAddress !== undefined && chainId !== undefined

  const getKey = (
    pageIndex: number,
    _previousPageData: ApiResponse<ApiResponseType>,
  ) => {
    if (!shouldFetch) return null

    const skip = pageIndex * PAGE_SIZE

    return [
      'user/courses',
      {
        userAddress: userAddress,
        chainId: chainId,
        roles: roles,
        skip: skip,
        limit: PAGE_SIZE,
      },
    ]
  }

  const {
    data: response,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite<ApiResponse<ApiResponseType>>(
    getKey,
    ([query, variables]: ApiRequestUrlAndParams) =>
      client.request(query, variables),
  )

  const data = response?.reduce(
    (acc: ApiResponseType, obj) => {
      if (obj.data && Array.isArray(obj.data.credentials)) {
        acc.credentials.push(...obj.data.credentials)
      }
      return acc
    },
    { credentials: [] },
  )

  const hasMore =
    response?.[response.length - 1]?.data?.credentials.length === PAGE_SIZE

  return {
    data: data,
    isLoading: isLoading,
    isValidating: isValidating,
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
    size: size,
    setSize: setSize,
    hasMore: hasMore,
  }
}

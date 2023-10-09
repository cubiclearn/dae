import { Address } from 'viem'
import { UserCredentials } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRInfiniteHook } from '@dae/types'
import useSWRInfinite from 'swr/infinite'
import { ONE_MINUTE } from '@dae/constants'

const PAGE_SIZE = 10

type ApiResponseDataType = { userCredentials: UserCredentials[] }

export const useCourseCredentialOwners = (
  credentialCid: string | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRInfiniteHook<ApiResponseDataType> => {
  const client = useApi()

  const shouldFetch =
    credentialCid !== undefined &&
    courseAddress !== undefined &&
    chainId !== undefined

  const getKey = (
    pageIndex: number,
    _previousPageData: ApiResponse<ApiResponseDataType>,
  ) => {
    if (!shouldFetch) return null

    const skip = pageIndex * PAGE_SIZE

    return [
      'course/credential/users',
      {
        credentialCid: credentialCid,
        courseAddress: courseAddress,
        chainId: chainId,
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
  } = useSWRInfinite<ApiResponse<ApiResponseDataType>>(
    getKey,
    ([query, variables]: ApiRequestUrlAndParams) =>
      client.request(query, variables),
    {
      refreshInterval: ONE_MINUTE * 10,
    },
  )

  const data = response?.reduce(
    (acc: ApiResponseDataType, obj) => {
      if (obj.data && Array.isArray(obj.data.userCredentials)) {
        acc.userCredentials.push(...obj.data.userCredentials)
      }
      return acc
    },
    { userCredentials: [] },
  )

  const hasMore =
    response?.[response.length - 1]?.data?.userCredentials.length === PAGE_SIZE

  return {
    data: data,
    isLoading: isLoading || (!data && !error),
    isValidating: isValidating,
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
    size: size,
    setSize: setSize,
    hasMore: hasMore,
  }
}

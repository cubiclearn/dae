import { Address } from 'viem'
import { UserCredentials } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRInfiniteHook } from '@dae/types'
import useSWRInfinite from 'swr/infinite'

const PAGE_SIZE = 10

type ApiResponseDataType = {
  teachers: UserCredentials[]
}

export const useCourseTeachers = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
): SWRInfiniteHook<ApiResponseDataType> => {
  const client = useApi()

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const getKey = (
    pageIndex: number,
    _previousPageData: ApiResponse<ApiResponseDataType>,
  ) => {
    if (!shouldFetch) return null

    const skip = pageIndex * PAGE_SIZE

    return [
      'course/teachers',
      {
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
  )

  const data = response?.reduce(
    (acc: ApiResponseDataType, obj) => {
      if (obj.data && Array.isArray(obj.data.teachers)) {
        acc.teachers.push(...obj.data.teachers)
      }
      return acc
    },
    { teachers: [] },
  )

  const hasMore =
    response?.[response.length - 1]?.data?.teachers.length === PAGE_SIZE

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

import { Address } from 'viem'
import { UserCredentials } from '@dae/database'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRInfiniteHook } from '@dae/types'
import useSWRInfinite from 'swr/infinite'
import { ONE_MINUTE } from '@dae/constants'

const PAGE_SIZE = 10

type ApiResponseDataType = {
  teachers: UserCredentials[]
}

type QueryParameters = {
  courseAddress: Address
  chainId: number
  skip: number
  limit?: number
}

type HookParams = {
  courseAddress: Address | undefined
  chainId: number | undefined
}

type HookOptions = {
  fetchAll: boolean
}

export const useCourseTeachers = (
  { courseAddress, chainId }: HookParams,
  { fetchAll }: HookOptions = { fetchAll: false },
): SWRInfiniteHook<ApiResponseDataType> => {
  const client = useApi()

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const getKey = (
    pageIndex: number,
    _previousPageData: ApiResponse<ApiResponseDataType>,
  ) => {
    if (!shouldFetch) return null

    const skip = pageIndex * PAGE_SIZE

    const queryParameters: QueryParameters = {
      courseAddress: courseAddress,
      chainId: chainId,
      skip: skip,
    }

    if (!fetchAll) {
      queryParameters.limit = PAGE_SIZE
    }

    return ['course/teachers', queryParameters]
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
      if (obj.data && Array.isArray(obj.data.teachers)) {
        acc.teachers.push(...obj.data.teachers)
      }
      return acc
    },
    { teachers: [] },
  )

  const hasMore = fetchAll
    ? false
    : response?.[response.length - 1]?.data?.teachers.length === PAGE_SIZE

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

import { Address } from 'viem'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRInfiniteHook } from '@dae/types'
import useSWRInfinite from 'swr/infinite'
import { PROPOSALS_QUERY } from '../../graphql'

const PAGE_SIZE = 10

export const useCourseProposals = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
  status: 'active' | 'closed',
): SWRInfiniteHook<PROPOSALS_QUERY> => {
  const client = useApi()

  const shouldFetch = courseAddress !== undefined && chainId !== undefined

  const getKey = (
    pageIndex: number,
    _previousPageData: ApiResponse<PROPOSALS_QUERY>,
  ) => {
    if (!shouldFetch) return null

    const skip = pageIndex * PAGE_SIZE

    return [
      'course/space/proposals',
      {
        courseAddress: courseAddress,
        chainId: chainId,
        status: status,
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
  } = useSWRInfinite<ApiResponse<PROPOSALS_QUERY>>(
    getKey,
    ([query, variables]: ApiRequestUrlAndParams) =>
      client.request(query, variables),
  )

  const data = response?.reduce(
    (acc: PROPOSALS_QUERY, obj) => {
      if (obj.data && Array.isArray(obj.data.proposals)) {
        acc.proposals.push(...obj.data.proposals)
      }
      return acc
    },
    { proposals: [] },
  )

  const hasMore =
    response?.[response.length - 1]?.data?.proposals.length === PAGE_SIZE

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

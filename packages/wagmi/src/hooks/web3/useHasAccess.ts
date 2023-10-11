import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { ONE_MINUTE } from '@dae/constants'
import { Address, zeroAddress } from 'viem'
import { useContractRead, useNetwork } from 'wagmi'
import { useCourse } from '../api'

export const useHasAccess = (
  courseAddress: Address | undefined,
  userAddress: Address | undefined,
) => {
  const { chain } = useNetwork()
  const { data: courseData } = useCourse(courseAddress, chain?.id)

  const shouldFetch =
    userAddress !== undefined &&
    courseAddress !== undefined &&
    courseData?.course.karma_access_control_address !== undefined

  const { data, isLoading, isError, isSuccess } = useContractRead({
    abi: KarmaAccessControlAbiUint64,
    address: courseData?.course.karma_access_control_address as Address,
    functionName: 'hasAccess',
    args: [userAddress ?? zeroAddress],
    enabled: shouldFetch,
    cacheTime: ONE_MINUTE * 10,
    staleTime: ONE_MINUTE * 5,
  })

  return {
    data,
    isError,
    isLoading: Boolean(isLoading || (data === undefined && !isError)),
    isSuccess,
  }
}

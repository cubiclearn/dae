import { Address, zeroAddress } from 'viem'
import { useContractRead } from 'wagmi'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { UseWeb3ReadHookInterface } from '@dae/types'

export const useKarmaBalance = (
  karmaAccessControlAddress: Address | undefined,
  userAddress: Address | undefined,
): UseWeb3ReadHookInterface<bigint> => {
  const { data: hasAccess } = useContractRead({
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbiUint64,
    functionName: 'hasAccess',
    args: [userAddress ?? zeroAddress],
    enabled: !!userAddress,
  })

  const shouldFetch = karmaAccessControlAddress && userAddress && hasAccess

  const { data, isLoading, error, isError, isSuccess } = useContractRead({
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbiUint64,
    functionName: 'ratingOf',
    args: [userAddress ?? zeroAddress],
    enabled: !!shouldFetch,
  })

  if (hasAccess === false) {
    return {
      data: undefined,
      error: new Error(
        "Unable to calculate your karma rating. You don't have a MAGISTER or DISCIPULUS credential for this course.",
      ),
      isLoading: false,
      isError: true,
      isSuccess: false,
    }
  }

  return shouldFetch
    ? { data, isLoading, error, isError, isSuccess }
    : {
        data: undefined,
        error: new Error('Invalid karmaAccessControlAddress or studentAddress'),
        isLoading: false,
        isError: true,
        isSuccess: false,
      }
}

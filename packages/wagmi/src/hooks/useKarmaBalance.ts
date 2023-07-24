import { Address } from 'viem'
import { useContractRead } from 'wagmi'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'

export const useKarmaBalance = (
  karmaAccessControlAddress: Address | undefined,
  userAddress: Address | undefined,
) => {
  const shouldFetch = karmaAccessControlAddress && userAddress

  const { data, isLoading, error, isError, isSuccess } = useContractRead({
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbiUint64,
    functionName: 'ratingOf',
    args: [userAddress ?? '0x0000000000000000000000000000000000000000'],
    enabled: !!shouldFetch,
  })

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

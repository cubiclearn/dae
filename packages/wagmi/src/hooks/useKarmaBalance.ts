import {Address} from 'viem'
import {useContractRead} from 'wagmi'
import {KarmaAccessControlAbi} from '@dae/abi'

export const useKarmaBalance = (
  karmaAccessControlAddress: Address | undefined,
  studentAddress: Address | undefined
) => {
  const {data, isLoading, error, isError, isSuccess, isIdle} = useContractRead({
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbi,
    functionName: 'ratingOf',
    args: [studentAddress !== undefined ? studentAddress : '0x0000000000000000000000000000000000000000'],
    enabled: karmaAccessControlAddress !== undefined && studentAddress !== undefined,
  })

  if (karmaAccessControlAddress === undefined || studentAddress === undefined) {
    return {
      data: undefined,
      error: new Error('Invalid karmaAccessControlAddress or studentAddress'),
      isLoading: false,
      isError: true,
      isSuccess: false,
    }
  }

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isIdle,
  }
}

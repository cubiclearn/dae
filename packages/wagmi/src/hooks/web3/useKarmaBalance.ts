import { Address } from 'viem'
import { useContractReads } from 'wagmi'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { UseWeb3ReadHookInterface } from '@dae/types'

export const useKarmaBalance = (
  karmaAccessControlAddress: Address | undefined,
  userAddress: Address | undefined,
): UseWeb3ReadHookInterface<
  | {
      hasAccess: boolean | undefined
      rate: number | undefined
      baseKarma: number | undefined
    }
  | undefined
> => {
  const karmaAccessControlContract = {
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbiUint64,
    args: userAddress ? [userAddress] : undefined,
  }

  const { data, isLoading, isError, error, isSuccess } = useContractReads({
    contracts: [
      {
        ...karmaAccessControlContract,
        functionName: 'hasAccess',
      },
      {
        ...karmaAccessControlContract,
        functionName: 'ratingOf',
      },
      {
        ...karmaAccessControlContract,
        functionName: 'getBaseKarma',
      },
    ],
    enabled: Boolean(karmaAccessControlAddress && userAddress),
  })

  return {
    data: data && {
      hasAccess: Boolean(data[0].result),
      rate: Number(data[1].result),
      baseKarma: Number(data[2].result),
    },
    isError,
    isLoading,
    isSuccess,
    error,
  }
}

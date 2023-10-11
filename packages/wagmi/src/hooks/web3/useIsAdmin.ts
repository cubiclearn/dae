import { CredentialsBurnableAbi } from '@dae/abi'
import { Address, toHex, zeroAddress } from 'viem'
import { useAccount, useContractRead } from 'wagmi'

export const useIsAdmin = (courseAddress: Address | undefined) => {
  const { address: userAddress } = useAccount()

  const { data, isLoading, isError, isSuccess } = useContractRead({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: 'hasRole',
    args: [toHex(0, { size: 32 }), userAddress ?? zeroAddress],
    enabled: userAddress !== undefined && courseAddress !== undefined,
    cacheTime: Infinity,
    staleTime: Infinity,
  })

  return {
    data,
    isError,
    isLoading: Boolean(isLoading || (data === undefined && !isError)),
    isSuccess,
  }
}

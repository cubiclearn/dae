import { CredentialsBurnableAbi } from '@dae/abi'
import { ONE_MINUTE } from '@dae/constants'
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

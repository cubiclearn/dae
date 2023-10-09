import { CredentialsBurnableAbi } from '@dae/abi'
import { ONE_MINUTE } from '@dae/constants'
import { Address, keccak256, toHex, zeroAddress } from 'viem'
import { useAccount, useContractRead } from 'wagmi'

export const useIsMagister = (courseAddress: Address | undefined) => {
  const { address: userAddress } = useAccount()

  const { data, isLoading, isError, isSuccess } = useContractRead({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: 'hasRole',
    args: [keccak256(toHex('MAGISTER_ROLE')), userAddress ?? zeroAddress],
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

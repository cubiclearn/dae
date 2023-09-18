import { CredentialsBurnableAbi } from '@dae/abi'
import { Address, keccak256, toHex, zeroAddress } from 'viem'
import { useContractRead } from 'wagmi'

const THREE_MINUTES = 1000 * 60 * 3

export const useIsAdminOrMagister = (
  courseAddress: Address | undefined,
  userAddress: Address | undefined,
) => {
  const {
    data: isMagister,
    isLoading: isLoadingMagister,
    isError: isErrorFetchingMagister,
    isSuccess: isSuccessLoadingMagister,
  } = useContractRead({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: 'hasRole',
    args: [keccak256(toHex('MAGISTER_ROLE')), userAddress ?? zeroAddress],
    enabled: userAddress !== undefined && courseAddress !== undefined,
    cacheTime: THREE_MINUTES,
  })

  const {
    data: isAdmin,
    isLoading: isLoadingAdmin,
    isError: isErrorFetchingAdmin,
    isSuccess: isSuccessLoadingAdmin,
  } = useContractRead({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: 'hasRole',
    args: [keccak256(toHex('DEFAULT_ADMIN_ROLE')), userAddress ?? zeroAddress],
    enabled: userAddress !== undefined && courseAddress !== undefined,
    cacheTime: THREE_MINUTES,
  })

  return {
    data: isAdmin || isMagister,
    isError: isErrorFetchingAdmin || isErrorFetchingMagister,
    isLoading: isLoadingAdmin || isLoadingMagister,
    isSuccess: isSuccessLoadingAdmin && isSuccessLoadingMagister,
  }
}

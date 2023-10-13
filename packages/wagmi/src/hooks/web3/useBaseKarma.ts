import { Address } from 'viem'
import { useContractRead } from 'wagmi'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { ONE_MINUTE } from '@dae/constants'

export const useBaseKarma = ({
  karmaAccessControlAddress,
  userAddress,
}: {
  karmaAccessControlAddress: Address | undefined
  userAddress: Address | undefined
}) => {
  const { data: hasAccess } = useContractRead({
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbiUint64,
    args: userAddress ? [userAddress] : undefined,
    functionName: 'hasAccess',
    enabled: Boolean(karmaAccessControlAddress && userAddress),
    cacheTime: ONE_MINUTE * 10,
    staleTime: ONE_MINUTE * 5,
  })

  const { data, isLoading, isError, error, isSuccess } = useContractRead({
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbiUint64,
    args: userAddress ? [userAddress] : undefined,
    functionName: 'getBaseKarma',
    enabled: Boolean(karmaAccessControlAddress && userAddress && hasAccess),
    cacheTime: ONE_MINUTE * 10,
    staleTime: ONE_MINUTE * 5,
  })

  return {
    data: hasAccess ? Number(data as bigint) : undefined,
    isError,
    isLoading,
    isSuccess,
    error,
  }
}

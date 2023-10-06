import { Address } from 'viem'
import { useContractReads } from 'wagmi'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { ONE_MINUTE } from '@dae/constants'

type useKarmaBalancesProps = {
  karmaAccessControlAddress: Address | undefined
  usersAddresses: Address[] | undefined
}

export const useKarmaBalances = ({
  karmaAccessControlAddress,
  usersAddresses = [],
}: useKarmaBalancesProps) => {
  const shouldFetch =
    karmaAccessControlAddress !== undefined && usersAddresses.length > 0

  const { data, isError, isLoading, isSuccess, error } = useContractReads({
    contracts: usersAddresses.map((userAddress) => ({
      abi: KarmaAccessControlAbiUint64,
      address: karmaAccessControlAddress,
      functionName: 'ratingOf',
      args: [userAddress],
    })),
    enabled: shouldFetch,
    cacheOnBlock: true,
    scopeKey: 'karma',
    cacheTime: ONE_MINUTE * 15,
    staleTime: ONE_MINUTE * 10,
  })

  return {
    data,
    isError,
    isLoading,
    isSuccess,
    error,
  }
}

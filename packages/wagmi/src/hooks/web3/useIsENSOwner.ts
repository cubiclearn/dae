import { Address } from 'viem'
import { useEnsAddress, useNetwork } from 'wagmi'

export const useIsENSOwner = (
  userAddress: Address | undefined,
  ENSName: string | undefined,
) => {
  const { chain } = useNetwork()
  const shouldFetch =
    chain &&
    !!userAddress &&
    !!ENSName &&
    !!ENSName.match(/^([a-z0-9-]+\.eth)$/i)

  const { data, isError, isLoading, isSuccess } = useEnsAddress({
    name: ENSName,
    enabled: shouldFetch,
    cacheTime: 1000 * 60 * 3,
    chainId: chain?.id === 31337 || chain?.testnet ? 5 : 1,
  })

  return {
    data: data === undefined ? undefined : data === userAddress,
    isError,
    isLoading,
    isSuccess,
  }
}

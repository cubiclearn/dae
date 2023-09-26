import { ChainId } from '@dae/chains'
import { Address } from 'viem'
import { useEnsAddress, useNetwork } from 'wagmi'

const THREE_MINUTES = 1000 * 60 * 3
const ENS_REGEX = /^([a-z0-9-]+\.eth)$/i

export const useIsENSOwner = (
  userAddress: Address | undefined,
  ENSName: string | undefined,
) => {
  const { chain } = useNetwork()
  const shouldFetch =
    chain && !!userAddress && !!ENSName && !!ENSName.match(ENS_REGEX)

  const { data, isError, isLoading, isSuccess } = useEnsAddress({
    name: ENSName,
    enabled: shouldFetch,
    cacheTime: THREE_MINUTES,
    chainId:
      chain?.id === ChainId.FOUNDRY || chain?.testnet
        ? ChainId.GOERLI
        : ChainId.ETHEREUM,
  })

  return {
    data: data === undefined ? undefined : data === userAddress,
    isError,
    isLoading: isLoading || (!data && !isError),
    isSuccess,
  }
}

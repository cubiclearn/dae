import { Address } from 'wagmi'
import { FactoryContractAddress } from '@dae/chains'

export const useChainCredentialsFactoryAddress = ({
  chainId,
}: {
  chainId: number | undefined
}) => {
  if (chainId === undefined) {
    return undefined
  }

  return FactoryContractAddress[
    chainId as keyof FactoryContractAddress
  ] as Address
}

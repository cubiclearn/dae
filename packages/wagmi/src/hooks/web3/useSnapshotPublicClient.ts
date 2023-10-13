import { usePublicClient } from 'wagmi'
import { ChainKey, ChainToSnapshotChain } from '@dae/chains'

export const useSnapshotPublicClient = ({
  courseChainId,
}: {
  courseChainId: number | undefined
}) => {
  if (courseChainId === undefined) {
    return undefined
  }
  const chain = ChainToSnapshotChain[courseChainId as keyof typeof ChainKey]

  const client = usePublicClient({
    chainId: chain.id,
  })

  return client
}

import { useEthersSigner } from './useEthersSigner'
import snapshot from '@snapshot-labs/snapshot.js'
import { useAccount } from 'wagmi'
import { ChainSnapshotHub } from '@dae/chains'
import { ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types'

export const useVotePropsal = (
  spaceName: string,
  spaceNetwork: keyof typeof ChainSnapshotHub,
  proposalId: string,
  type: ProposalType,
  choice: number,
) => {
  const { address } = useAccount()
  const hub = ChainSnapshotHub[spaceNetwork]
  const snapshotClient = new snapshot.Client712(hub)
  const signer = useEthersSigner()

  const vote = async () => {
    const receipt = await snapshotClient.vote(
      signer as any,
      address as string,
      {
        space: spaceName,
        proposal: proposalId,
        type: type,
        choice: choice,
      },
    )
    console.log(receipt)
  }
  return {
    vote,
  }
}

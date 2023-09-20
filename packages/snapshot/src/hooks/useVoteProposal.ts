import { useEthersSigner } from './useEthersSigner'
import snapshot from '@snapshot-labs/snapshot.js'
import { useAccount } from 'wagmi'
import { ChainSnapshotHub } from '@dae/chains'
import { ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types'
import { useHookState } from './useHookState'

export const useVotePropsal = (
  spaceName: string,
  spaceNetwork: keyof typeof ChainSnapshotHub,
  proposalId: string,
  type: ProposalType,
) => {
  const { address } = useAccount()
  const { isSuccess, isValidating, isLoading, isError, error, ...state } =
    useHookState()

  const hub = ChainSnapshotHub[spaceNetwork]
  const snapshotClient = new snapshot.Client712(hub)
  const signer = useEthersSigner()

  const vote = async (choice: number, reason: string) => {
    try {
      state.setLoading()
      await snapshotClient.vote(signer as any, address as string, {
        space: spaceName,
        proposal: proposalId,
        type: type,
        choice: choice,
        reason: reason,
      })
      state.setSuccess()
    } catch (e) {
      state.handleError(e)
      throw e
    }
  }
  return {
    vote,
    isLoading,
    isError,
    isSuccess,
    error,
    isValidating,
  }
}

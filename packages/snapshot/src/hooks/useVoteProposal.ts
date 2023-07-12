import { useEthersSigner } from './useEthersSigner'
import snapshot from '@snapshot-labs/snapshot.js'
import { useAccount } from 'wagmi'
import { ChainSnapshotHub } from '@dae/chains'
import { ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types'
import { useState } from 'react'

export const useVotePropsal = (
  spaceName: string,
  spaceNetwork: keyof typeof ChainSnapshotHub,
  proposalId: string,
  type: ProposalType,
  choice: number,
) => {
  const { address } = useAccount()
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const hub = ChainSnapshotHub[spaceNetwork]
  const snapshotClient = new snapshot.Client712(hub)
  const signer = useEthersSigner()

  const vote = async () => {
    try {
      setIsSuccess(false)
      setIsError(false)
      setIsLoading(true)
      await snapshotClient.vote(signer as any, address as string, {
        space: spaceName,
        proposal: proposalId,
        type: type,
        choice: choice,
      })
      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsError(true)
      setError(error.error_description)
      throw error
    }
  }
  return {
    vote,
    isLoading,
    isError,
    isSuccess,
    error,
  }
}

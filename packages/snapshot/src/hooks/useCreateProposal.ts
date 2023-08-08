import { useAccount, useBlockNumber, useNetwork } from 'wagmi'
import snapshot from '@snapshot-labs/snapshot.js'
import { useEthersSigner } from './useEthersSigner'
import { ChainSnapshotHub } from '@dae/chains'
import { useState } from 'react'
import { Proposal } from '@snapshot-labs/snapshot.js/dist/sign/types'

export const useCreateProposal = (snapshotSpaceENS: string | undefined) => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { data: blockNumber } = useBlockNumber()

  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const spaceNetwork = chain!.id as keyof typeof ChainSnapshotHub
  const hub = ChainSnapshotHub[spaceNetwork]
  const snapshotClient = new snapshot.Client712(hub)

  const signer = useEthersSigner()

  const create = async (
    proposalTitle: string,
    proposalDescription: string,
    choices: string[],
    endTime: number,
    discussion: string,
  ) => {
    try {
      setIsSuccess(false)
      setIsError(false)
      setIsLoading(true)

      if (!chain) {
        throw new Error("You're not connected to Web3.")
      }

      if (!snapshotSpaceENS) {
        throw new Error('Snapshot Space ENS is undefined.')
      }

      if (!blockNumber) {
        throw new Error('Wait to finish fetching data from blockain.')
      }

      if (Math.floor(Date.now() / 1000) > endTime) {
        throw new Error('The end date cannot be in the past.')
      }

      await snapshotClient.proposal(
        signer as any,
        address as string,
        {
          space: snapshotSpaceENS,
          type: 'single-choice',
          title: proposalTitle,
          body: proposalDescription,
          choices: choices,
          start: Math.floor(Date.now() / 1000),
          end: endTime,
          snapshot: Number(blockNumber),
          discussion: discussion,
          plugins: JSON.stringify({}),
        } as Proposal,
      )

      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsError(true)
      setError(error.message)
      console.log(error)
      throw error
    }
  }

  return {
    create,
    isLoading,
    isError,
    isSuccess,
    error,
  }
}

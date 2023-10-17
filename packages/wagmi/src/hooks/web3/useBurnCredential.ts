import { useContractWrite, useNetwork, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { CredentialsBurnableAbi } from '@dae/abi'
import { useWeb3HookState } from '../useWeb3HookState'
import type { UseWeb3WriteHookInterface } from '@dae/types'
import { CredentialType } from '@dae/database'
import { CONFIRMATION_BLOCKS } from '@dae/constants'
import { mutate } from 'swr'
import { useEditSnapshotSpace } from '@dae/snapshot'

interface BurnCredentialHookInterface extends UseWeb3WriteHookInterface {
  burnCredential: (tokenId: number) => Promise<void>
}

export function useBurnCredential({
  courseAddress,
  credentialType,
}: {
  courseAddress: Address
  credentialType: CredentialType
}): BurnCredentialHookInterface {
  const {
    isSuccess,
    isValidating,
    isLoading,
    isSigning,
    isError,
    error,
    ...state
  } = useWeb3HookState()

  const publicClient = usePublicClient()
  const { chain } = useNetwork()

  const { writeAsync: burn } = useContractWrite({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: credentialType === 'MAGISTER' ? 'burnMagister' : 'burn',
  })

  const { removeModerator } = useEditSnapshotSpace(courseAddress, chain?.id)

  const burnCredential = async (tokenId: number): Promise<void> => {
    try {
      state.setValidating()

      if (burn === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      const credentialOwner = await publicClient.readContract({
        abi: CredentialsBurnableAbi,
        address: courseAddress,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      })

      state.setSigning()

      const writeResult = await burn({
        args: [BigInt(tokenId)],
      })

      await fetch('/api/v0/transactions', {
        method: 'POST',
        body: JSON.stringify({
          txHash: writeResult.hash,
          chainId: publicClient.chain.id,
          action: 'BURN_CREDENTIAL',
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      state.setLoading()

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
        confirmations: CONFIRMATION_BLOCKS,
      })

      const deleteResponse = await fetch(
        `/api/v0/user/course/credential?txHash=${txReceipt.transactionHash}&chainId=${publicClient.chain.id}`,
        {
          method: 'DELETE',
        },
      )

      if (!deleteResponse.ok) {
        const responseJSON = await deleteResponse.json()
        throw new Error(responseJSON.message)
      }

      if (credentialType === 'DISCIPULUS') {
        mutate(
          (key) => Array.isArray(key) && key[0] === 'course/students',
          undefined,
          { revalidate: true },
        )
      }

      if (credentialType === 'MAGISTER') {
        await removeModerator(credentialOwner)
        mutate(
          (key) => Array.isArray(key) && key[0] === 'course/teachers',
          undefined,
          { revalidate: true },
        )
      }

      if (credentialType === 'OTHER') {
        mutate(
          (key) => Array.isArray(key) && key[0] === 'course/credential/users',
          undefined,
          { revalidate: true },
        )
      }

      state.setSuccess()
    } catch (e: unknown) {
      const parsedError = state.handleError(e)
      throw parsedError
    }
  }

  return {
    burnCredential,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    isValidating,
  }
}

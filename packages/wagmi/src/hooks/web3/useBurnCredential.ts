import { useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { CredentialsBurnableAbi } from '@dae/abi'
import { mutate } from 'swr'
import { useWeb3HookState } from '../useWeb3HookState'
import type { UseWeb3WriteHookInterface } from '@dae/types'
import { CredentialType, UserCredentials } from '@dae/database'

interface BurnCredentialHookInterface extends UseWeb3WriteHookInterface {
  burnCredential: (tokenId: number) => Promise<void>
}

export function useBurnCredential(
  courseAddress: Address,
  credentialType: CredentialType,
): BurnCredentialHookInterface {
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

  const { writeAsync: burn } = useContractWrite({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: 'burn',
  })

  const burnCredential = async (tokenId: number): Promise<void> => {
    try {
      state.setValidating()

      if (burn === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

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
      })

      const deleteResponse = await fetch(
        `/api/v0/user/course/credentials?txHash=${txReceipt.transactionHash}&chainId=${publicClient.chain.id}`,
        {
          method: 'DELETE',
        },
      )

      if (!deleteResponse.ok) {
        const responseJSON = await deleteResponse.json()
        throw new Error(responseJSON.error)
      }

      const responseJSON = (await deleteResponse.json()) as {
        success: boolean
        data: UserCredentials
      }

      if (credentialType === 'OTHER') {
        await mutate(
          `/api/v0/course/credential/users?credentialCid=${responseJSON.data.credential_ipfs_cid}&courseAddress=${responseJSON.data.course_address}&chainId=${responseJSON.data.course_chain_id}`,
        )
      }

      if (credentialType === 'DISCIPULUS') {
        await mutate(
          `/api/v0/course/students?courseAddress=${courseAddress}&chainId=${responseJSON.data.course_chain_id}`,
        )
      }

      if (credentialType === 'MAGISTER') {
        await mutate(
          `/api/v0/course/credential/users?credentialCid=${responseJSON.data.credential_ipfs_cid}&courseAddress=${responseJSON.data.course_address}&chainId=${responseJSON.data.course_chain_id}`,
        )
      }

      state.setSuccess()
    } catch (error: unknown) {
      state.handleError(error)
      throw error
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

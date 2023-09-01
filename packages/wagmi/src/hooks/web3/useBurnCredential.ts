import { useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { CredentialsBurnableAbi } from '@dae/abi'
import { mutate } from 'swr'
import { useWeb3HookState } from '../useWeb3HookState'
import { UseWeb3WriteHookInterface } from '@dae/types'

interface BurnCredentialHookInterface extends UseWeb3WriteHookInterface {
  burnCredential: (tokenId: number, credentialId: number) => Promise<void>
}

export function useBurnCredential(
  courseAddress: Address,
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

  const burnCredential = async (
    tokenId: number,
    credentialId: number,
  ): Promise<void> => {
    state.setValidating()

    try {
      if (burn === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      state.setSigning()

      const writeResult = await burn({
        args: [BigInt(tokenId)],
      })

      state.setLoading()

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
      })

      const response = await fetch(
        `/api/v0/user/course/credentials?txHash=${txReceipt.transactionHash}&chainId=${publicClient.chain.id}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        const responseJSON = await response.json()
        throw new Error(responseJSON.error)
      }

      await mutate(
        `/api/v0/course/credential/users?credentialId=${credentialId}`,
      )
      state.setSuccess()
    } catch (error: any) {
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

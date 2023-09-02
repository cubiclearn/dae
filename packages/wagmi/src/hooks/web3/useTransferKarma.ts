import { useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { useWeb3HookState } from '../useWeb3HookState'

export function useTransferKarma(
  karmaAccessControlAddress: Address | undefined,
) {
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

  const { writeAsync } = useContractWrite({
    abi: KarmaAccessControlAbiUint64,
    address: karmaAccessControlAddress,
    functionName: 'rate',
  })

  const transfer = async (
    userAddress: Address,
    karmaIncrement: number,
  ): Promise<void> => {
    try {
      state.setValidating()
      if (karmaAccessControlAddress === undefined) {
        throw new Error('Karma Access Control Address is invalid')
      }

      const hasAccess = await publicClient.readContract({
        abi: KarmaAccessControlAbiUint64,
        address: karmaAccessControlAddress,
        functionName: 'hasAccess',
        args: [userAddress],
      })

      if (hasAccess !== true) {
        throw new Error(
          'The provided address does not correspond to an enrolled course participant.',
        )
      }

      const userCurrentKarmaAmount = await publicClient.readContract({
        abi: KarmaAccessControlAbiUint64,
        address: karmaAccessControlAddress,
        functionName: 'ratingOf',
        args: [userAddress],
      })

      if (Number(userCurrentKarmaAmount) + karmaIncrement < 0) {
        throw new Error('Invalid karma amount. The amount cannot be negative.')
      }

      if (writeAsync === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      state.setSigning()

      const data = await writeAsync({
        args: [userAddress, userCurrentKarmaAmount + BigInt(karmaIncrement)],
      })

      state.setLoading()

      await publicClient.waitForTransactionReceipt({
        hash: data.hash as Address,
      })

      state.setSuccess()
    } catch (error: any) {
      state.handleError(error)
      throw error
    }
  }

  return {
    transfer,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    isValidating,
  }
}

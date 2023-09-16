import { useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { useWeb3HookState } from '../useWeb3HookState'

export type TransferData = {
  address: Address
  karma_increment: number
}

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

  const { writeAsync: rate } = useContractWrite({
    abi: KarmaAccessControlAbiUint64,
    address: karmaAccessControlAddress,
    functionName: 'rate',
  })

  const { writeAsync: multiRate } = useContractWrite({
    abi: KarmaAccessControlAbiUint64,
    address: karmaAccessControlAddress,
    functionName: 'multiRate',
  })

  const transfer = async (
    userAddress: Address,
    karmaIncrement: number,
  ): Promise<void> => {
    try {
      state.setValidating()

      if (karmaIncrement === 0) {
        throw new Error('Karma increment value cannot be 0.')
      }

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

      if (rate === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      state.setSigning()

      const data = await rate({
        args: [userAddress, userCurrentKarmaAmount + BigInt(karmaIncrement)],
      })

      state.setLoading()

      await publicClient.waitForTransactionReceipt({
        hash: data.hash as Address,
      })

      state.setSuccess()
    } catch (e: any) {
      state.handleError(e)
      throw e
    }
  }

  const multiTransfer = async (transferData: TransferData[]): Promise<void> => {
    try {
      state.setValidating()

      const isZeroIncrement = transferData.some(
        (item) => item.karma_increment === 0,
      )

      if (isZeroIncrement) {
        throw new Error('Karma increment value cannot be 0.')
      }

      if (karmaAccessControlAddress === undefined) {
        throw new Error('Karma Access Control Address is invalid')
      }

      const accessResult = await Promise.all(
        transferData.map(async (user) => {
          const hasAccess = await publicClient.readContract({
            abi: KarmaAccessControlAbiUint64,
            address: karmaAccessControlAddress,
            functionName: 'hasAccess',
            args: [user.address],
          })
          return { address: user.address, hasAccess: hasAccess }
        }),
      )

      const addressesWithNoAccess = accessResult
        .filter((item) => !item.hasAccess)
        .map((item) => item.address)

      if (addressesWithNoAccess.length > 0) {
        throw new Error(
          `The provided address (${addressesWithNoAccess.join(
            ', ',
          )}) does not correspond to an enrolled course participant.`,
        )
      }

      const karmaAmounts = await Promise.all(
        transferData.map(async (user) => {
          const userCurrentKarmaAmount = await publicClient.readContract({
            abi: KarmaAccessControlAbiUint64,
            address: karmaAccessControlAddress,
            functionName: 'ratingOf',
            args: [user.address],
          })

          if (Number(userCurrentKarmaAmount) + user.karma_increment < 0) {
            throw new Error(
              'Invalid karma amount. The amount cannot be negative.',
            )
          }

          return {
            address: user.address,
            totalKarma: Number(userCurrentKarmaAmount) + user.karma_increment,
          }
        }),
      )

      if (multiRate === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      state.setSigning()

      const data = await multiRate({
        args: [
          karmaAmounts.map((user) => user.address as Address),
          karmaAmounts.map((user) => BigInt(user.totalKarma)),
        ],
      })

      state.setLoading()

      await publicClient.waitForTransactionReceipt({
        hash: data.hash as Address,
      })

      state.setSuccess()
    } catch (e: any) {
      state.handleError(e)
      throw e
    }
  }

  return {
    transfer,
    multiTransfer,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    isValidating,
  }
}

import { useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { useWeb3HookState } from '../useWeb3HookState'
import { CONFIRMATION_BLOCKS } from '@dae/constants'

export type TransferData = {
  address: Address
  karma_increment: number
}

export function useTransferKarma({
  karmaAccessControlAddress,
}: { karmaAccessControlAddress: Address | undefined }) {
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
        throw new Error(
          'Your entry has a karma increment value of 0 which makes no sense. Please fix it and try again.',
        )
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

      const userBaseKarma = await publicClient.readContract({
        abi: KarmaAccessControlAbiUint64,
        address: karmaAccessControlAddress,
        functionName: 'getBaseKarma',
        args: [userAddress],
      })

      if (Number(userCurrentKarmaAmount) + karmaIncrement < userBaseKarma) {
        throw new Error(
          'Invalid karma amount. The amount cannot be under user base karma.',
        )
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
        confirmations: CONFIRMATION_BLOCKS,
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

      const hasZeroKarmaIncrementEntry = transferData.some(
        (item) => item.karma_increment === 0,
      )

      if (hasZeroKarmaIncrementEntry) {
        throw new Error(
          'Some of your entries have a karma increment value of 0 which makes no sense. Please fix them or remove them and try again.',
        )
      }

      if (karmaAccessControlAddress === undefined) {
        throw new Error('Karma Access Control Address is invalid')
      }

      const addressesAccessData = await Promise.all(
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

      const addressesWithNoAccess = addressesAccessData
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

          const userBaseKarma = await publicClient.readContract({
            abi: KarmaAccessControlAbiUint64,
            address: karmaAccessControlAddress,
            functionName: 'getBaseKarma',
            args: [user.address],
          })

          if (
            Number(userCurrentKarmaAmount) + user.karma_increment <
            userBaseKarma
          ) {
            throw new Error(
              `Invalid karma amount. The amount cannot be under user base karma for address ${user.address}.`,
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
        confirmations: CONFIRMATION_BLOCKS,
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

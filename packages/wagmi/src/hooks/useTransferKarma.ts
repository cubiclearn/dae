import { useState } from 'react'
import { useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'

export function useTransferKarma(
  karmaAccessControlAddress: Address | undefined,
) {
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

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
      setIsSuccess(false)
      setIsError(false)
      setIsSigning(true)
      setIsLoading(false)

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

      const data = await writeAsync({
        args: [userAddress, userCurrentKarmaAmount + BigInt(karmaIncrement)],
      })
      setIsLoading(true)
      setIsSigning(false)

      await publicClient.waitForTransactionReceipt({
        hash: data.hash as Address,
      })
      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsSigning(false)
      setIsError(true)
      setError(error.message)
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
  }
}

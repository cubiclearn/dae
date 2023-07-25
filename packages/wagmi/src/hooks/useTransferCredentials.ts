import { useState } from 'react'
import { useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { CredentialsBurnableAbi } from '@dae/abi'

export function useTransferCredentials(courseAddress: Address) {
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  const publicClient = usePublicClient()

  const { writeAsync } = useContractWrite({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: 'mint',
  })

  const transfer = async (
    address: Address,
    tokenURI: string,
    discordUsername: string,
    userEmail: string,
  ): Promise<void> => {
    setIsSuccess(false)
    setIsError(false)
    setIsSigning(true)

    try {
      if (writeAsync === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      const writeResult = await writeAsync({
        args: [address, tokenURI, 2],
      })

      setIsLoading(true)
      setIsSigning(false)

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
      })

      const response = await fetch('/api/v0/user/course/credentials', {
        method: 'POST',
        body: JSON.stringify({
          txHash: txReceipt.transactionHash,
          discordUsername,
          userEmail,
          chainId: publicClient.chain.id,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      if (response.ok) {
        setIsLoading(false)
        setIsSuccess(true)
      } else {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`)
      }
    } catch (error: any) {
      setIsLoading(false)
      setIsSigning(false)
      setIsError(true)
      setError(error.message || 'An error occurred')
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

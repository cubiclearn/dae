import { useState } from 'react'
import { useContractWrite, usePublicClient } from 'wagmi'
import { Address, ContractFunctionExecutionError } from 'viem'
import { CredentialsBurnableAbi } from '@dae/abi'
import { mutate } from 'swr'

export function useBurnCredential(courseAddress: Address) {
  const [error, setError] = useState<Error | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

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
    setIsSuccess(false)
    setIsError(false)
    setIsSigning(true)

    try {
      if (burn === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      const writeResult = await burn({
        args: [BigInt(tokenId)],
      })

      setIsLoading(true)
      setIsSigning(false)

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

      setIsLoading(false)
      setIsSuccess(true)
      mutate(`/api/v0/course/credential/users?credentialId=${credentialId}`)
    } catch (error: any) {
      setIsLoading(false)
      setIsSigning(false)
      setIsError(true)
      if (error instanceof ContractFunctionExecutionError) {
        setError(new Error(error.details))
      } else {
        setError(new Error(error.message || 'An error occurred'))
      }
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
  }
}

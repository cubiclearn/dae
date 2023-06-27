import {useState} from 'react'
import {useContractWrite} from 'wagmi'
import {WriteContractResult, getPublicClient} from '@wagmi/core'
import {Address, TransactionReceipt} from 'viem'
import {usePrepareContractWrite} from 'wagmi'
import {CredentialsAbi} from '@dae/abi'

export function useAirdropCredentials(courseAddress: Address, addresses: Address[], tokenURIs: string[]) {
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  const {config} = usePrepareContractWrite({
    abi: CredentialsAbi,
    address: courseAddress,
    functionName: 'multiMint',
    args: [addresses, tokenURIs],
    enabled: addresses.length !== 0 && tokenURIs.length !== 0 && addresses.length === tokenURIs.length,
  })
  const contractWrite = useContractWrite(config)

  const enroll = async (): Promise<void> => {
    setIsSuccess(false)
    setIsError(false)
    setIsSigning(true)
    const client = getPublicClient()

    try {
      if (addresses.length === 0 || tokenURIs.length === 0) {
        throw new Error('Form fields cannot be empty')
      }

      if (addresses.length !== tokenURIs.length) {
        throw new Error('TokenUri list and addresses list must be of the same length')
      }

      if (contractWrite.writeAsync === undefined) {
        throw new Error('The data provided is incorrect. Please ensure that you have entered the correct information.')
      }
      const writeResult: WriteContractResult = await contractWrite.writeAsync!()
      setIsLoading(true)
      setIsSigning(false)

      const txReceipt: TransactionReceipt = await client.waitForTransactionReceipt({
        hash: writeResult.hash,
      })

      const response = await fetch('/api/v0/course/students', {
        method: 'POST',
        body: JSON.stringify({
          txHash: txReceipt.transactionHash,
          chainId: client.chain.id,
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
    enroll,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
  }
}

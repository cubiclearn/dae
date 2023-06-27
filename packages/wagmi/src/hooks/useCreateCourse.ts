import {useState} from 'react'
import {useContractWrite, usePrepareContractWrite} from 'wagmi'
import {WriteContractResult, getPublicClient} from '@wagmi/core'
import {Address, TransactionReceipt} from 'viem'
import {CredentialsFactoryAbi} from '@dae/abi'

export function useCreateCourse(isBurnable: boolean, name: string, symbol: string, bUri: string, maxSupply: bigint) {
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  const {config} = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Address,
    functionName: 'createCourse',
    args: [isBurnable, name, symbol, bUri, maxSupply],
    abi: CredentialsFactoryAbi,
    enabled: name !== '' && symbol !== '' && bUri !== '' && maxSupply !== BigInt(0),
  })
  const contractWrite = useContractWrite(config)

  const create = async () => {
    setIsSuccess(false)
    setIsError(false)
    setIsSigning(true)
    const client = getPublicClient()

    try {
      if (name === '' || symbol === '' || bUri === '' || maxSupply === BigInt(0)) {
        throw new Error('Please fill in all the required form fields.')
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

      const response = await fetch('/api/v0/course', {
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
    }
  }

  return {
    create,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
  }
}

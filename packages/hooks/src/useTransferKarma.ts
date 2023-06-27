import {useState} from 'react'
import {useContractWrite, useContractRead} from 'wagmi'
import {WriteContractResult, getPublicClient} from '@wagmi/core'
import {Address} from 'viem'
import {usePrepareContractWrite} from 'wagmi'
import {KarmaAccessControlAbi} from '@dae/abi'

export function useTransferKarma(
  karmaAccessControlAddress: Address | undefined,
  studentAddress: Address | undefined,
  newKarmaAmount: bigint | undefined
) {
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  const {data: hasAccess} = useContractRead({
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbi,
    args: [studentAddress !== undefined ? studentAddress : '0x0000000000000000000000000000000000000000'],
    functionName: 'hasAccess',
    enabled: karmaAccessControlAddress !== undefined && studentAddress !== undefined,
  })

  const {config} = usePrepareContractWrite({
    abi: KarmaAccessControlAbi,
    address: karmaAccessControlAddress,
    functionName: 'rate',
    args: [
      studentAddress !== undefined ? studentAddress : '0x0000000000000000000000000000000000000000',
      newKarmaAmount !== undefined ? newKarmaAmount : BigInt(0),
    ],
    enabled:
      karmaAccessControlAddress !== undefined &&
      studentAddress !== undefined &&
      newKarmaAmount !== undefined &&
      hasAccess === true,
  })
  const contractWrite = useContractWrite(config)

  const transferKarma = async (): Promise<void> => {
    try {
      setIsSuccess(false)
      setIsError(false)
      setIsSigning(true)
      setIsLoading(false)
      const client = getPublicClient()

      if (karmaAccessControlAddress === undefined || studentAddress === undefined || newKarmaAmount === undefined) {
        throw new Error('Please fill in all the required form fields.')
      }

      if (hasAccess !== true) {
        throw new Error('The provided address does not correspond to an enrolled course participant.')
      }

      if (contractWrite.writeAsync === undefined) {
        throw new Error('The data provided is incorrect. Please ensure that you have entered the correct information.')
      }

      const promise = contractWrite.writeAsync()
      const data: WriteContractResult = await promise
      setIsLoading(true)
      setIsSigning(false)

      await client.waitForTransactionReceipt({hash: data.hash as Address})
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
    transferKarma,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
  }
}

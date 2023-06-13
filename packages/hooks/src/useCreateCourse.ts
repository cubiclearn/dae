import { useState } from 'react'
import { useContractWrite } from 'wagmi'
import { WriteContractResult, getPublicClient } from '@wagmi/core'
import { TransactionReceipt } from 'viem'

export function useCreateCourse(config :any) {
  const [error, setError] = useState<string|null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const contractWrite = useContractWrite(config)

  const create = async () => {
    setIsSuccess(false)
    setIsError(false)
    const client = getPublicClient()
    try {
        const promise: Promise<WriteContractResult> = new Promise(
            (resolve, reject) => {
              contractWrite.writeAsync!()
                .then((data: WriteContractResult) => {
                  resolve(data)
                  setIsLoading(true)
                })
                .catch((error: any) => {
                  reject(error)
                })
            },
          )
        const promise2: Promise<TransactionReceipt> = promise.then(
            (data: WriteContractResult) => {
              return client.waitForTransactionReceipt({
                hash: data.hash as `0x${string}`,
              })
            },
          )
        const promise3 = promise2.then((txReceipt: TransactionReceipt) => {
            return fetch('/api/v0/course', {
              method: 'POST',
              body: JSON.stringify({
                txHash: txReceipt.transactionHash,
                chainId: client.chain.id,
              }),
              headers: {
                'Content-type': 'application/json; charset=UTF-8',
              },
            })
          })
        await promise3
        setIsLoading(false)
        setIsSuccess(true)
    }catch(e: any){
        setIsLoading(false)
        setIsError(true)
        setError(e.message)
    }
  }

  return {
    create,
    isLoading,
    isError,
    isSuccess,
    error,
  }
}

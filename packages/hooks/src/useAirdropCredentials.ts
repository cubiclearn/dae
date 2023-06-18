import { useCallback, useState } from 'react'
import { useContractWrite } from 'wagmi'
import { WriteContractResult, getPublicClient } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { usePrepareContractWrite } from 'wagmi'
import { CredentialsAbi } from '@dae/abi'
import { isAddress } from 'viem'
import { useEffect } from 'react'

export function useAirdropCredentials(courseAddress : `0x${string}` , addresses : `0x${string}`[], tokenURIs : any[]) {
  const [error, setError] = useState<string|null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  const { config, refetch } = usePrepareContractWrite({
    abi: CredentialsAbi,
    address: courseAddress,
    functionName: 'multiMint',
    args: [addresses, tokenURIs],
    enabled: false,
  })
  const contractWrite = useContractWrite(config)

  useEffect(() => {
    if (areInputsValid()) {
      refetch()
    }
    if(isError){
      setIsError(false)
    }
  },[addresses, tokenURIs])

  function isURL(str: string) {
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i
    return urlPattern.test(str)
  }

  const checkTokenURIsListIsCorrect = useCallback(() => {
    if(tokenURIs.length === 0){
      setError('Token URIs list cannot be empty')
      return false;
    }
    for (let i = 0; i < tokenURIs.length; i++) {
      if (!isURL(tokenURIs[i])) {
        setError('TokenURI list is not valid!')
        return false
      }
    }
    return true
  },[tokenURIs])

  const checkAddressesListIsCorrect = useCallback(() => {
    if(addresses.length === 0){
      setError('Address list cannot be empty')
      return false;
    }
    for (let i = 0; i < addresses.length; i++) {
      if (!isAddress(addresses[i])) {
        setError('Address list is not valid!')
        return false
      }
    }
    return true
  },[addresses])

  const areInputsValid = useCallback( () => {
    if (
      checkTokenURIsListIsCorrect() &&
      checkAddressesListIsCorrect() &&
      tokenURIs.length === addresses.length &&
      tokenURIs.length > 0 &&
      addresses.length > 0
    ) {
      setIsError(false)
      return true
    }
    return false
  }, [tokenURIs, addresses])

  const enroll = async () => {
    setIsSuccess(false)
    setIsError(false)
    setIsSigning(true)
    const client = getPublicClient()
    try {
        if(!areInputsValid()){
          throw new Error("Invalid inputs error")
        }

        const promise: Promise<WriteContractResult> = new Promise(
            (resolve, reject) => {
              contractWrite.writeAsync!()
                .then((data: WriteContractResult) => {
                  resolve(data)
                  setIsLoading(true)
                  setIsSigning(false)
                })
                .catch((error: any) => {
                  console.log('Contract write error:', error);
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
            return fetch('/api/v0/course/students', {
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
    }catch(_e){
        setIsLoading(false)
        setIsSigning(false)
        setIsError(true)
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

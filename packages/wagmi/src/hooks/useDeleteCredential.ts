import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { Address } from 'viem'

export const useDeleteCredential = (
  credentialId: number | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const { mutate } = useSWRConfig()

  const deleteCredential = async () => {
    if (
      credentialId === undefined ||
      courseAddress === undefined ||
      chainId === undefined
    ) {
      return
    }

    setIsLoading(true)
    setIsSuccess(false)
    setIsError(false)
    setError('')

    try {
      const queryString = `credentialId=${credentialId}&courseAddress=${courseAddress}&chainId=${chainId}`
      const apiResponse = await fetch(
        `/api/v0/course/credential?${queryString}`,
        {
          method: 'DELETE',
        },
      )

      if (!apiResponse.ok) {
        const responseJSON = await apiResponse.json()
        throw new Error(responseJSON.error)
      }
      await mutate(
        `/api/v0/course/credentials?address=${courseAddress}&chainId=${chainId}`,
      )
      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsError(true)
      setError(error.message || 'An error occurred deleting this credential.')
      throw error
    }
  }

  return {
    deleteCredential,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}

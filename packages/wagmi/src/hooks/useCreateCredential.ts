import { useState } from 'react'
import { Address } from 'viem'

export const useCreateCredential = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const create = async (
    image: File,
    name: string,
    description: string,
    courseAddress: Address,
    chainId: number,
  ) => {
    setIsLoading(true)
    setIsSuccess(false)
    setIsError(false)
    setError('')

    try {
      const formData = new FormData()
      formData.set('file', image)
      formData.set('name', name)
      formData.set('description', description)
      formData.set('courseAddress', courseAddress)
      formData.set('chainId', chainId.toString())

      const metadataIPFSResponse = await fetch('/api/v0/course/credential', {
        method: 'POST',
        body: formData,
      })

      if (!metadataIPFSResponse.ok) {
        const responseJSON = await metadataIPFSResponse.json()
        throw new Error(responseJSON.error)
      }

      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsError(true)
      setError(error.message || 'An error occurred creating this credential.')
      throw error
    }
  }

  return {
    create,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}

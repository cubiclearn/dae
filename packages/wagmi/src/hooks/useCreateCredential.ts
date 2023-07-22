import { useState } from 'react'

export const useCreateCredential = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const create = async (formData: FormData) => {
    setIsLoading(true)
    setIsSuccess(false)
    setIsError(false)
    setError('')

    try {
      const metadataIPFSResponse = await fetch('/api/v0/course/credentials', {
        method: 'POST',
        body: formData,
      })

      if (!metadataIPFSResponse.ok) {
        throw new Error(
          `HTTP ${metadataIPFSResponse.status} - ${metadataIPFSResponse.statusText}`,
        )
      }

      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsError(true)
      setError(error.message || 'An error occurred during IPFS upload.')
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

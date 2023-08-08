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

import { useState } from 'react'

export const useApiRequest = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const makeRequest = async (request: Promise<Response>) => {
    setIsLoading(true)
    setIsSuccess(false)
    setIsError(false)
    setError(null)

    try {
      const response = await request

      if (!response.ok) {
        const responseJSON = await response.json()
        throw new Error(responseJSON.error)
      }

      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsError(true)
      setError(
        new Error(error.message || 'An error occurred processing the request.'),
      )
      throw error
    }
  }

  return {
    makeRequest,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}

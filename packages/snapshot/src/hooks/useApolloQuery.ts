import { useCallback, useState } from 'react'
import { apolloClient } from '../graphql/apollo'
import { ApolloError, QueryOptions } from '@apollo/client'

export type UseApolloQueryResult<T> = {
  data: any | undefined
  isLoading: boolean
  isSuccess: boolean
  error: ApolloError | undefined
  isError: boolean
  query: (queryOptions: QueryOptions) => {}
}

export const useApolloQuery = (): UseApolloQueryResult<any> => {
  const [error, setError] = useState<ApolloError | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any | undefined>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const query = useCallback(async (queryOptions: QueryOptions) => {
    setIsLoading(true)
    try {
      const response = await apolloClient.query(queryOptions)
      setIsLoading(false)
      setIsSuccess(true)
      setData(response.data)
      return response
    } catch (error: any) {
      setIsLoading(false)
      setIsError(true)
      setError(error)
      throw error
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    isError,
    isSuccess,
    query,
  }
}

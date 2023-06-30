import { useCallback, useState } from 'react'
import { apolloClient } from '../graphql/apollo'
import { ApolloQueryResult, QueryOptions } from '@apollo/client'

export function useApolloQuery() {
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ApolloQueryResult<any> | undefined>(
    undefined,
  )

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
    isError,
    isSuccess,
    error,
    query,
  }
}

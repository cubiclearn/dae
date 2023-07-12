import { useCallback, useState } from 'react'
import { apolloClient } from '../graphql/apollo'
import { ApolloError, QueryOptions } from '@apollo/client'
import { useNetwork } from 'wagmi'

export type UseApolloQueryResult<T> = {
  data: any | undefined
  isLoading: boolean
  isSuccess: boolean
  error: ApolloError | undefined
  isError: boolean
  query: (queryOptions: QueryOptions) => {}
}

export const useApolloQuery = (uri: string): UseApolloQueryResult<any> => {
  const [error, setError] = useState<ApolloError | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any | undefined>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const query = useCallback(async (queryOptions: QueryOptions) => {
    setIsLoading(true)
    try {
      const client = apolloClient(uri)
      const response = await client.query(queryOptions)
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

export const useSnapshotApolloQuery = () => {
  const { chain } = useNetwork()
  return useApolloQuery(
    chain?.testnet
      ? 'https://testnet.snapshot.org/graphql'
      : 'https://hub.snapshot.org/graphql',
  )
}

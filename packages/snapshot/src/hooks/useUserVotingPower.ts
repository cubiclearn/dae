import { Address } from 'viem'
import { USER_VOTING_POWER_QUERY } from '../graphql/queries'
import { useSnapshotApolloQuery } from './useApolloQuery'
import { useEffect, useState } from 'react'

export const useUserVotingPower = (
  proposalId: string | undefined,
  userAddress: Address | undefined,
  space: string | undefined,
) => {
  const { data, query } = useSnapshotApolloQuery()
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (
      proposalId !== undefined &&
      userAddress !== undefined &&
      space !== undefined
    ) {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          await query({
            query: USER_VOTING_POWER_QUERY,
            variables: {
              proposalId: proposalId,
              userAddress: userAddress,
              spaceId: space,
            },
          })
          setIsError(false)
          setError(null)
        } catch (e: any) {
          setIsError(true)
          setError(e)
        }
        setIsLoading(false)
      }

      fetchData()
    }
  }, [proposalId, userAddress, space])

  return {
    data,
    isLoading,
    isError,
    error,
  }
}

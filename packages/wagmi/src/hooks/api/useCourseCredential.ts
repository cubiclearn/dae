import useSWRImmutable from 'swr/immutable'
import { Credential } from '@dae/database'
import { Address } from 'viem'
import { ApiRequestUrlAndParams, useApi } from '@dae/hooks'
import { ApiResponse, SWRHook } from '@dae/types'
import { useNetwork } from 'wagmi'

export const useCourseCredential = ({
  courseAddress,
  credentialCid,
}: {
  courseAddress: Address | undefined
  credentialCid: string | undefined
}): SWRHook<{ credential: Credential }> => {
  const client = useApi()
  const { chain } = useNetwork()
  const shouldFetch =
    credentialCid !== undefined &&
    courseAddress !== undefined &&
    chain?.id !== undefined

  const { data: response, error } = useSWRImmutable<
    ApiResponse<{ credential: Credential }>
  >(
    shouldFetch
      ? [
          'course/credential',
          {
            credentialCid: credentialCid,
            courseAddress: courseAddress,
            chainId: chain.id,
          },
        ]
      : null,
    ([query, variables]: ApiRequestUrlAndParams) =>
      client.request(query, variables),
  )

  return {
    data: response?.data || undefined,
    isLoading: Boolean(!response && !error),
    isError: Boolean(error),
    error: error,
    isSuccess: Boolean(response && !error),
  }
}

import { useSWRConfig } from 'swr'
import { Address } from 'viem'
import { useApiRequest } from './useApiRequest'

export const useDeleteCredential = (
  credentialCid: string | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
) => {
  const { makeRequest, ...requestState } = useApiRequest()
  const { mutate } = useSWRConfig()

  const deleteCredential = async () => {
    if (
      credentialCid === undefined ||
      courseAddress === undefined ||
      chainId === undefined
    ) {
      throw new Error('Missing required parameters for deletion.')
    }

    const urlParamsDeletion = new URLSearchParams({
      credentialCid: credentialCid,
      courseAddress: courseAddress.toString(),
      chainId: chainId.toString(),
    })
    const request = fetch(`/api/v0/course/credential?${urlParamsDeletion}`, {
      method: 'DELETE',
    })

    await makeRequest(request)

    mutate(
      (key) => Array.isArray(key) && key[0] === 'course/credentials',
      undefined,
      { revalidate: true },
    )
  }

  return {
    deleteCredential,
    ...requestState,
  }
}

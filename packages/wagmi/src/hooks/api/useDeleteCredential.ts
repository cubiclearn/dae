import { useSWRConfig } from 'swr'
import { Address } from 'viem'
import { useHookState } from '../useHookState'

export const useDeleteCredential = (
  credentialCid: string | undefined,
  courseAddress: Address | undefined,
  chainId: number | undefined,
) => {
  const { isSuccess, isValidating, isLoading, isError, error, ...state } =
    useHookState()

  const { mutate } = useSWRConfig()

  const deleteCredential = async () => {
    state.setValidating()
    if (
      credentialCid === undefined ||
      courseAddress === undefined ||
      chainId === undefined
    ) {
      throw new Error('Missing required parameters for deleting credential.')
    }

    state.setLoading()

    const urlParamsDeletion = new URLSearchParams({
      credentialCid: credentialCid,
      courseAddress: courseAddress.toString(),
      chainId: chainId.toString(),
    })
    const response = await fetch(
      `/api/v0/course/credential?${urlParamsDeletion}`,
      {
        method: 'DELETE',
      },
    )

    if (!response.ok) {
      const responseJSON = await response.json()
      throw new Error(responseJSON.error)
    }

    mutate(
      (key) => Array.isArray(key) && key[0] === 'course/credentials',
      undefined,
      { revalidate: true },
    )
    state.setSuccess()
  }

  return {
    deleteCredential,
    isSuccess,
    isValidating,
    isLoading,
    isError,
    error,
  }
}

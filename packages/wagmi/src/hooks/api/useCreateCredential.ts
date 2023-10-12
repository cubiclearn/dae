import { Address } from 'viem'
import { mutate } from 'swr'
import { useHookState } from '../useHookState'

export const useCreateCredential = () => {
  const { isSuccess, isValidating, isLoading, isError, error, ...state } =
    useHookState()

  const create = async (
    image: File | undefined,
    name: string | undefined,
    description: string | undefined,
    courseAddress: Address | undefined,
    chainId: number | undefined,
  ) => {
    try {
      state.setValidating()
      if (
        image === undefined ||
        name === undefined ||
        description === undefined ||
        courseAddress === undefined ||
        chainId === undefined
      ) {
        throw new Error(
          'Missing required parameters for creating new credential.',
        )
      }

      state.setLoading()

      const formData = new FormData()
      formData.set('file', image)
      formData.set('name', name)
      formData.set('description', description)
      formData.set('courseAddress', courseAddress)
      formData.set('chainId', chainId.toString())

      const response = await fetch('/api/v0/course/credential', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const responseJSON = await response.json()
        throw new Error(responseJSON.message)
      }

      mutate(
        (key) => Array.isArray(key) && key[0] === 'course/credentials',
        undefined,
        { revalidate: true },
      )
      state.setSuccess()
    } catch (e) {
      state.handleError(e)
      throw e
    }
  }

  return {
    create,
    isSuccess,
    isValidating,
    isLoading,
    isError,
    error,
  }
}

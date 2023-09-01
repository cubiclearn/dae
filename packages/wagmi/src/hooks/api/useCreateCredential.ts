import { Address } from 'viem'
import { useApiRequest } from './useApiRequest'

export const useCreateCredential = () => {
  const { makeRequest, ...requestState } = useApiRequest()

  const create = async (
    image: File,
    name: string,
    description: string,
    courseAddress: Address,
    chainId: number,
  ) => {
    const formData = new FormData()
    formData.set('file', image)
    formData.set('name', name)
    formData.set('description', description)
    formData.set('courseAddress', courseAddress)
    formData.set('chainId', chainId.toString())

    const request = fetch('/api/v0/course/credential', {
      method: 'POST',
      body: formData,
    })

    await makeRequest(request)
  }

  return {
    create,
    ...requestState,
  }
}

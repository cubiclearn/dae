import { API_BASE_PATH } from '@dae/constants'

export type ApiRequestUrlAndParams = [
  query: string,
  variables: Record<string, string>,
]

export const useApi = () => {
  const request = async (url: string, params: Record<string, string>) => {
    const URLParams = new URLSearchParams(params)
    const requestUrl = `${API_BASE_PATH}/${url}?${URLParams}`

    const response = await fetch(requestUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    return response.json()
  }

  return {
    request,
  }
}

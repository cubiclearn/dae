import { Address } from 'viem'
import useSWR from 'swr'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  return response.json()
}

export const useCourse = (address: Address, chainId: number) => {
  const { data, error, isLoading } = useSWR(
    `/api/v0/course?address=${address}&chainId=${chainId}`,
    fetcher,
  )

  return {
    data,
    error,
    isLoading,
  }
}

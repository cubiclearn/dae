import { useNetwork, useAccount } from 'wagmi'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useTeacherCourses() {
  const { chain } = useNetwork()
  const { address } = useAccount()

  const { data, error, isLoading } = useSWR(
    () => `/api/v0/teacher/courses?chainId=${chain?.id}&address=${address}`,
    fetcher,
  )

  return {
    data,
    isLoading,
    error,
  }
}

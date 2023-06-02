import {useNetwork} from 'wagmi'
import useSWR, {Fetcher} from 'swr'

const fetcher: Fetcher<any, string> = (url: string) => fetch(url).then((r) => r.json())

export function useCourseStudents(address: string | undefined) {
  const {chain} = useNetwork()

  const {data, error, isLoading} = useSWR(
    address !== undefined ? `/api/v0/course/students?chainId=${chain?.id}&address=${address}` : null,
    fetcher
  )

  return {
    data,
    isLoading,
    error,
  }
}

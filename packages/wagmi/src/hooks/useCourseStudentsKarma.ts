import { Address } from 'viem'
import { useContractReads } from 'wagmi'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'

export const useCourseStudentsKarma = (
  studentsAddresses: Address[],
  karmaAccessControlAddress: Address | undefined,
  chainId: number | undefined,
) => {
  const shouldFetchKarmaData =
    studentsAddresses.length > 0 &&
    karmaAccessControlAddress !== undefined &&
    chainId !== undefined

  const karmaAccessControlContract = {
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbiUint64,
    functionName: 'ratingOf',
  }

  const contracts = shouldFetchKarmaData
    ? studentsAddresses.map((studentAddress) => ({
        ...karmaAccessControlContract,
        args: [studentAddress],
      }))
    : []

  const {
    data,
    isError: error,
    isLoading,
  } = useContractReads({
    contracts,
    cacheOnBlock: true,
    select: (data) =>
      data
        .filter((el) => el.status === 'success')
        .map((el) => Number(el.result as BigInt)),
    enabled: shouldFetchKarmaData,
  })

  return {
    data,
    error,
    isLoading,
  }
}

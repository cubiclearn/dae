import { FormControl, FormLabel, Text } from '@chakra-ui/react'
import { useContractRead, Address } from 'wagmi'
import { KarmaAccessControlAbi } from '@dae/abi'
import { isAddress } from 'viem'
import { useEffect } from 'react'

type KarmaCounterProps = {
  karmaAccessControlAddress: Address
  studentAddress: string
  onStudentKarmaChange: (karma: number) => void
}

export const KarmaCounter = ({
  karmaAccessControlAddress,
  studentAddress,
  onStudentKarmaChange,
}: KarmaCounterProps) => {
  const {
    data: studentKarma,
    isError,
    isLoading,
  } = useContractRead({
    address: karmaAccessControlAddress,
    abi: KarmaAccessControlAbi,
    functionName: 'ratingOf',
    args: [studentAddress],
    enabled: isAddress(studentAddress),
  })

  useEffect(() => {
    // Notify parent component about the change in studentAddress
    if (studentKarma !== undefined && studentKarma !== null) {
      onStudentKarmaChange(Number(studentKarma))
    }
  }, [studentKarma, onStudentKarmaChange])

  if (
    isLoading ||
    isError ||
    studentKarma === undefined ||
    studentKarma === null
  ) {
    return (
      <FormControl width={'10%'}>
        <FormLabel>Cur.</FormLabel>
        <Text fontWeight={'semibold'} fontSize={'2xl'}>
          --
        </Text>
      </FormControl>
    )
  }

  return (
    <FormControl width={'10%'}>
      <FormLabel>Cur.</FormLabel>
      <Text fontWeight={'semibold'} fontSize={'2xl'}>
        {studentKarma!.toString()}
      </Text>
    </FormControl>
  )
}

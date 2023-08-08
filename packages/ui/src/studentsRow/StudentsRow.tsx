import React from 'react'
import { Avatar, Text, Td, Tr } from '@chakra-ui/react'
import type { UserCredentials } from '@dae/database'
import { useCourseData } from '../CourseProvider'
import { Address } from 'viem'
import { useKarmaBalance } from '@dae/wagmi'

export type StudentsRowProps = {
  student: UserCredentials
}

export const StudentsRow: React.FC<StudentsRowProps> = ({ student }) => {
  const course = useCourseData()

  const { data: karmaBalance, isSuccess } = useKarmaBalance(
    course.data
      ? (course.data.karma_access_control_address as Address)
      : undefined,
    student.user_address as Address,
  )

  return (
    <Tr>
      <Td>
        <Avatar src='' size={'sm'} />
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize='md'>
          {student.user_address}
        </Text>
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize='md'>
          {student.email}
        </Text>
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize='md'>
          {student.discord_handle}
        </Text>
      </Td>
      <Td isNumeric>{isSuccess ? karmaBalance?.toString() : '--'}</Td>
    </Tr>
  )
}

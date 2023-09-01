import React from 'react'
import { Avatar, Text, Td, Tr } from '@chakra-ui/react'
import type { UserCredentials } from '@dae/database'
import { useCourseData } from '../CourseProvider'
import { Address } from 'viem'
import { useKarmaBalance } from '@dae/wagmi'

export type UserRowProps = {
  user: UserCredentials
}

export const UserRow: React.FC<UserRowProps> = ({ user }) => {
  const course = useCourseData()

  const { data: karmaBalance, isSuccess } = useKarmaBalance(
    course.data
      ? (course.data.karma_access_control_address as Address)
      : undefined,
    user.user_address as Address,
  )

  return (
    <Tr>
      <Td>
        <Avatar src="" size={'sm'} />
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize="md">
          {user.user_address}
        </Text>
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize="md">
          {user.user_email}
        </Text>
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize="md">
          {user.user_discord_handle}
        </Text>
      </Td>
      <Td isNumeric>{isSuccess ? karmaBalance?.toString() : '--'}</Td>
    </Tr>
  )
}

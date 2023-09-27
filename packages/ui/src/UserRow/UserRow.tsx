import React from 'react'
import { Avatar, Text, Td, Tr, Button } from '@chakra-ui/react'
import type { UserCredentials } from '@dae/database'
import { useCourseData } from '../CourseProvider'
import { Address } from 'viem'
import { useKarmaBalance } from '@dae/wagmi'

export type UserRowProps = {
  user: UserCredentials
  onDelete: () => void
  isDeleting: boolean
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  onDelete,
  isDeleting,
}) => {
  const { data: courseData } = useCourseData()

  const { data: karmaBalance } = useKarmaBalance(
    courseData?.karma_access_control_address as Address | undefined,
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
      <Td isNumeric>{karmaBalance ? karmaBalance?.rate?.toString() : '--'}</Td>
      <Td>
        <Button colorScheme="red" onClick={onDelete} isLoading={isDeleting}>
          X
        </Button>
      </Td>
    </Tr>
  )
}

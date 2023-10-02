import React from 'react'
import { Avatar, Text, Td, Tr, Button } from '@chakra-ui/react'
import { Address } from 'viem'

export type BaseCredentialRowProps = {
  user_address: Address
  user_email: string
  user_discord_handle: string
  user_karma_balance: number
  onDelete: () => void
  isDeleting: boolean
}

export const BaseCredentialRow: React.FC<BaseCredentialRowProps> = ({
  user_address,
  user_email,
  user_discord_handle,
  user_karma_balance,
  onDelete,
  isDeleting,
}) => {
  return (
    <Tr>
      <Td>
        <Avatar src="" size={'sm'} />
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize="md">
          {user_address}
        </Text>
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize="md">
          {user_email}
        </Text>
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize="md">
          {user_discord_handle}
        </Text>
      </Td>
      <Td isNumeric>{isNaN(user_karma_balance) ? '--' : user_karma_balance}</Td>
      <Td>
        <Button colorScheme="red" onClick={onDelete} isLoading={isDeleting}>
          X
        </Button>
      </Td>
    </Tr>
  )
}

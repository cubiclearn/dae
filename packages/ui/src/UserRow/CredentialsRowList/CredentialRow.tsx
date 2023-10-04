import React from 'react'
import { Avatar, Text, Td, Tr, Button } from '@chakra-ui/react'
import { Address } from 'viem'

export type UserRowProps = {
  user_address: Address
  onDelete: () => void
  isDeleting: boolean
}

export const CredentialRow: React.FC<UserRowProps> = ({
  user_address,
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
        <Button colorScheme="red" onClick={onDelete} isLoading={isDeleting}>
          X
        </Button>
      </Td>
    </Tr>
  )
}

import React from 'react'
import { Text, Td, Tr, Button } from '@chakra-ui/react'
import { Address } from 'viem'
import { Avatar } from '../../Avatar'

export type UserRowProps = {
  user_address: Address
  onDelete: (() => void) | undefined
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
        <Avatar address={user_address} />
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize="md">
          {user_address}
        </Text>
      </Td>
      <Td>
        <Button
          colorScheme={onDelete === undefined ? 'gray' : 'red'}
          isDisabled={onDelete === undefined ? true : false}
          onClick={onDelete}
          isLoading={isDeleting}
        >
          {onDelete === undefined ? '-' : 'X'}
        </Button>
      </Td>
    </Tr>
  )
}

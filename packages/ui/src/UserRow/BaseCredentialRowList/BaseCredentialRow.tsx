import React from 'react'
import { Text, Td, Tr, Button, Spinner } from '@chakra-ui/react'
import { Address } from 'viem'
import { Avatar } from '../../Avatar'
import { useKarmaBalance } from '@dae/wagmi'

export type BaseCredentialRowProps = {
  user_address: Address
  user_email: string
  user_discord_handle: string
  karma_access_control_address: Address
  onDelete: (() => void) | undefined
  isDeleting: boolean
}

export const BaseCredentialRow: React.FC<BaseCredentialRowProps> = ({
  user_address,
  user_email,
  user_discord_handle,
  karma_access_control_address,
  onDelete,
  isDeleting,
}) => {
  const { data: karmaData, isLoading: isLoadingKarma } = useKarmaBalance({
    karmaAccessControlAddress: karma_access_control_address,
    userAddress: user_address,
  })

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
        <Text verticalAlign={'center'} fontSize="md">
          {user_email}
        </Text>
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize="md">
          {user_discord_handle}
        </Text>
      </Td>
      <Td isNumeric>{isLoadingKarma ? <Spinner /> : karmaData}</Td>
      <Td>
        <Button
          colorScheme={onDelete === undefined ? 'gray' : 'red'}
          isDisabled={onDelete === undefined ? true : false}
          onClick={onDelete}
          isLoading={isDeleting}
        >
          {onDelete === undefined ? '' : 'X'}
        </Button>
      </Td>
    </Tr>
  )
}

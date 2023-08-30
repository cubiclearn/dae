import { Stack, Box } from '@chakra-ui/react'
import React from 'react'
import { CredentialInfo } from './CredentialInfo'
import { CredentialUsers } from './CredentialUsers'

type CredentialInfoContainerProps = {
  credentialId: number | undefined
}

export const CredentialInfoContainer: React.FC<CredentialInfoContainerProps> =
  ({ credentialId }) => {
    return (
      <Stack
        direction={{ base: 'column', lg: 'row' }} // Stack vertically on base, horizontally on lg
        spacing={8}
        maxW="100%"
      >
        <Box
          flex={{ base: 'none', lg: '1 1 30%', xl: '1 1 20%' }} // 30% width on lg, auto on base
          maxW={{ base: '100%', lg: 'none' }} // Adjust max width based on screen size
        >
          <CredentialInfo credentialId={credentialId} />
        </Box>
        <Box flex={{ base: '1', lg: '2 1 70%', xl: '2 1 80%' }}>
          <CredentialUsers credentialId={credentialId} />
        </Box>
      </Stack>
    )
  }

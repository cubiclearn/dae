import React, { useState } from 'react'
import { Box, FormControl, FormLabel, Stack, Switch } from '@chakra-ui/react'
import { CredentialsSingleTransferForm } from './CredentialsSingleTransferForm'
import { CredentialsBatchTransferForm } from './CredentialsBatchTransferForm'
import { Address } from 'viem'

type CredentialsTransferFormProps = {
  courseAddress: Address
}

export const CredentialsTransferForm: React.FC<CredentialsTransferFormProps> =
  ({ courseAddress }) => {
    const [multiEnroll, setMultiEnroll] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleMultiEnrollChange = () => {
      setMultiEnroll(!multiEnroll)
    }

    const handleIsLoading = (_isLoading: boolean) => {
      setIsLoading(_isLoading)
    }

    return (
      <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
        <Stack spacing={8}>
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Multi transfer?</FormLabel>
            <Switch onChange={handleMultiEnrollChange} isDisabled={isLoading} />
          </FormControl>
          {multiEnroll ? (
            <CredentialsBatchTransferForm
              courseAddress={courseAddress}
              onIsLoading={handleIsLoading}
            />
          ) : (
            <CredentialsSingleTransferForm
              courseAddress={courseAddress}
              onIsLoading={handleIsLoading}
            />
          )}
        </Stack>
      </Box>
    )
  }

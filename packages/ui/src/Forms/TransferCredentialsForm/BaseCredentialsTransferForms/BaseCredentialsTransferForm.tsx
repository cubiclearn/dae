import React, { useState } from 'react'
import { Box, FormControl, FormLabel, Stack, Switch } from '@chakra-ui/react'
import { BaseCredentialSingleTransferForm } from './BaseCredentialSingleTransferForm'
import { BaseCredentialsBatchTransfer } from './BaseCredentialsBatchTransferForm'
import { Address } from 'viem'

type BaseCredentialsTransferFormProps = {
  courseAddress: Address
  credentialType: 'MAGISTER' | 'DISCIPULUS'
}

export const BaseCredentialsTransferForm: React.FC<
  BaseCredentialsTransferFormProps
> = ({ courseAddress, credentialType }) => {
  const [multiEnroll, setMultiEnroll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleMultiEnrollChange = () => {
    setMultiEnroll(!multiEnroll)
  }

  const handleIsLoading = (_isLoading: boolean) => {
    setIsLoading(_isLoading)
  }

  if (credentialType === 'MAGISTER') {
    return (
      <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
        <BaseCredentialSingleTransferForm
          courseAddress={courseAddress}
          credentialType="MAGISTER"
          onIsLoading={handleIsLoading}
        />
      </Box>
    )
  }

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
      <Stack spacing={8}>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Multi enroll?</FormLabel>
          <Switch isDisabled={isLoading} onChange={handleMultiEnrollChange} />
        </FormControl>
        {multiEnroll ? (
          <BaseCredentialsBatchTransfer
            courseAddress={courseAddress}
            credentialType="DISCIPULUS"
            onIsLoading={handleIsLoading}
          />
        ) : (
          <BaseCredentialSingleTransferForm
            courseAddress={courseAddress}
            credentialType="DISCIPULUS"
            onIsLoading={handleIsLoading}
          />
        )}
      </Stack>
    </Box>
  )
}

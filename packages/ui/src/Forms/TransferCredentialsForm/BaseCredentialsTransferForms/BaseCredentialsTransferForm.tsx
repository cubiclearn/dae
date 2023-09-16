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

  const handleMultiEnrollChange = () => {
    setMultiEnroll(!multiEnroll)
  }

  if (credentialType === 'MAGISTER') {
    return (
      <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
        <BaseCredentialSingleTransferForm
          courseAddress={courseAddress}
          credentialType="MAGISTER"
        />
      </Box>
    )
  }

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
      <Stack spacing={8}>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Multi transfer?</FormLabel>
          <Switch onChange={handleMultiEnrollChange} />
        </FormControl>
        {multiEnroll ? (
          <BaseCredentialsBatchTransfer
            courseAddress={courseAddress}
            credentialType="DISCIPULUS"
          />
        ) : (
          <BaseCredentialSingleTransferForm
            courseAddress={courseAddress}
            credentialType="DISCIPULUS"
          />
        )}
      </Stack>
    </Box>
  )
}

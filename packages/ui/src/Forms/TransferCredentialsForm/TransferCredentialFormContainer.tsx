import React, { useState } from 'react'
import { Box, FormControl, FormLabel, Stack, Switch } from '@chakra-ui/react'
import { TransferCredentialForm } from './TranferCredentialForms/TransferCredentialForm'
import { TransferCredentialsForm } from './TranferCredentialForms/TransferCredentialsForm'
import { CredentialType } from '@dae/database'

type TransferCredentialsFormContainerProps = {
  courseAddress: string
  credentialType: CredentialType
}

export const TransferCredentialsFormContainer: React.FC<
  TransferCredentialsFormContainerProps
> = ({ courseAddress, credentialType }) => {
  const [multiEnroll, setMultiEnroll] = useState(false)

  const handleMultiEnrollChange = () => {
    setMultiEnroll(!multiEnroll)
  }

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
      <Stack spacing={8}>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Multi transfer?</FormLabel>
          <Switch onChange={handleMultiEnrollChange} />
        </FormControl>
        {multiEnroll ? (
          <TransferCredentialsForm
            courseAddress={courseAddress}
            credentialType={credentialType}
          />
        ) : (
          <TransferCredentialForm
            courseAddress={courseAddress}
            credentialType={credentialType}
          />
        )}
      </Stack>
    </Box>
  )
}

import { Box, FormControl, FormLabel, Stack, Switch } from '@chakra-ui/react'
import { KarmaSingleTransferForm } from './KarmaSingleTransferForm'
import { KarmaMultiTransferForm } from './KarmaMultiTransferForm'
import { useState } from 'react'

export const TransferKarmaForm = () => {
  const [multiTransfer, setMultiTransfer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleMultiEnrollChange = () => {
    setMultiTransfer(!multiTransfer)
  }

  const handleIsLoading = (_isLoading: boolean) => {
    setIsLoading(_isLoading)
  }

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
      <Stack spacing={8}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="email-alerts" mb="0">
            Multi transfer?
          </FormLabel>
          <Switch
            isDisabled={isLoading}
            id="email-alerts"
            onChange={handleMultiEnrollChange}
          />
        </FormControl>
        {multiTransfer ? (
          <KarmaMultiTransferForm onIsLoading={handleIsLoading} />
        ) : (
          <KarmaSingleTransferForm onIsLoading={handleIsLoading} />
        )}
      </Stack>
    </Box>
  )
}

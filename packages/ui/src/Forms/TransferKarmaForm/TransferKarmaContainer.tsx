import { Box, FormControl, FormLabel, Stack, Switch } from '@chakra-ui/react'
import { TransferKarmaForm } from './TransferKarmaForm'
import { MultiTransferKarmaForm } from './MultiTransferKarmaForm'
import { useState } from 'react'

export const TransferKarmaContainer = () => {
  const [multiTransfer, setMultiTransfer] = useState(false)

  const handleMultiEnrollChange = () => {
    setMultiTransfer(!multiTransfer)
  }

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
      <Stack spacing={8}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="email-alerts" mb="0">
            Multi transfer?
          </FormLabel>
          <Switch id="email-alerts" onChange={handleMultiEnrollChange} />
        </FormControl>
        {multiTransfer ? <MultiTransferKarmaForm /> : <TransferKarmaForm />}
      </Stack>
    </Box>
  )
}
